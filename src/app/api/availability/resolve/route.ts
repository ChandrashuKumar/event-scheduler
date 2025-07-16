import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

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

    const groupedByDate: Record<string, [number, number][][]> = {};

    for (const uid of userIds) {
      const userAvail = allAvailability.filter((a) => a.userId === uid);

      const dateMap: Record<string, [number, number][]> = {};
      for (const a of userAvail) {
        const start = new Date(a.startDateTime).getTime();
        const end = new Date(a.endDateTime).getTime();
        const dateKey = new Date(a.startDateTime).toISOString().split('T')[0]; // 'YYYY-MM-DD'
        if (!dateMap[dateKey]) dateMap[dateKey] = [];
        dateMap[dateKey].push([start, end]);
      }

      for (const date in dateMap) {
        if (!groupedByDate[date]) groupedByDate[date] = [];
        groupedByDate[date].push(dateMap[date].sort((x, y) => x[0] - y[0]));
      }
    }

    const final: Record<string, { start: string; end: string }[]> = {};

    for (const date in groupedByDate) {
      const allIntervals = groupedByDate[date];
      if (allIntervals.length < userIds.length) continue;

      let common = allIntervals[0];
      for (let i = 1; i < allIntervals.length; i++) {
        common = intersectIntervals(common, allIntervals[i]);
        if (common.length === 0) break;
      }

      if (common.length > 0) {
        final[date] = common.map(([start, end]) => ({
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
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
