// /app/api/availability/resolve/route.ts 

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

async function resolveForGroup(groupId: string) {
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  if (groupMembers.length === 0) return null;

  const userIds = groupMembers.map((m) => m.userId);

  const allAvailability = await prisma.availability.findMany({
    where: { groupId, userId: { in: userIds } },
  });

  const groupedByDate: Record<string, [number, number][][]> = {};

  for (const uid of userIds) {
    const userAvail = allAvailability.filter((a) => a.userId === uid);
    const dateMap: Record<string, [number, number][]> = {};

    for (const a of userAvail) {
      const start = new Date(a.startDateTime).getTime();
      const end = new Date(a.endDateTime).getTime();
      const dateKey = new Date(a.startDateTime).toISOString().split('T')[0];
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

  return final;
}

// GET: Single group
export async function GET(req: NextRequest) {
  try {
    const groupId = req.nextUrl.searchParams.get('groupId');
    if (!groupId) {
      return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
    }

    const resolved = await resolveForGroup(groupId);
    if (!resolved) {
      return NextResponse.json({ error: 'No members in group' }, { status: 404 });
    }

    return NextResponse.json(resolved);
  } catch (error) {
    console.error('[GET resolve error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Multiple groups
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const groupIds = body.groupIds;

    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      return NextResponse.json({ error: 'Invalid or missing groupIds' }, { status: 400 });
    }

    const result: Record<string, Record<string, { start: string; end: string }[]>> = {};

    for (const groupId of groupIds) {
      const resolved = await resolveForGroup(groupId);
      if (resolved) result[groupId] = resolved;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[POST resolve multi error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
