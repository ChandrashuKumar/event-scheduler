import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number) {
  const h = Math.floor(m / 60)
    .toString()
    .padStart(2, '0');
  const min = (m % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

function intersectIntervals(a: [number, number][], b: [number, number][]) {
  let i = 0,
    j = 0;
  const result: [number, number][] = [];

  while (i < a.length && j < b.length) {
    const [startA, endA] = a[i];
    const [startB, endB] = b[j];
    const start = Math.max(startA, startB);
    const end = Math.min(endA, endB);
    if (start < end) result.push([start, end]);

    if (endA < endB) i++;
    else j++;
  }

  return result;
}

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
  }

  try {
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    if (groupMembers.length === 0) {
      return NextResponse.json({ error: 'No members in group' }, { status: 400 });
    }

    const userIds = groupMembers.map((m) => m.userId);

    const allAvailability = await prisma.availability.findMany({
      where: {
        groupId,
        userId: { in: userIds },
      },
    });

    const membersPerDay: Record<string, [number, number][][]> = {};

    for (const uid of userIds) {
      const avail = allAvailability.filter((a) => a.userId === uid);

      const dayMap: Record<string, [number, number][]> = {};
      for (const a of avail) {
        const start = timeToMinutes(a.startTime);
        const end = timeToMinutes(a.endTime);
        if (!dayMap[a.day]) dayMap[a.day] = [];
        dayMap[a.day].push([start, end]);
      }

      for (const day in dayMap) {
        if (!membersPerDay[day]) membersPerDay[day] = [];
        membersPerDay[day].push(dayMap[day].sort((x, y) => x[0] - y[0]));
      }
    }

    const final: Record<string, { start: string; end: string }[]> = {};

    for (const day in membersPerDay) {
      const intervalsList = membersPerDay[day];
      let common = intervalsList[0];
      if (intervalsList.length < userIds.length) continue;
      for (let i = 1; i < intervalsList.length; i++) {
        common = intersectIntervals(common, intervalsList[i]);
        if (common.length === 0) break;
      }

      if (common.length > 0) {
        final[day] = common.map(([start, end]) => ({
          start: minutesToTime(start),
          end: minutesToTime(end),
        }));
      }
    }

    return NextResponse.json(final);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Resolve error:', error.message);
    } else {
      console.error('Resolve error:', error);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
