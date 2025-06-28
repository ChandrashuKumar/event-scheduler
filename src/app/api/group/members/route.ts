// /api/group/members.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  const groupId = req.nextUrl.searchParams.get('groupId');

  if (!token || !groupId) {
    return NextResponse.json({ error: 'Missing token or groupId' }, { status: 400 });
  }

  try {
    await auth.verifyIdToken(token);

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true },
    });

    return NextResponse.json(
      members.map((m) => ({ id: m.userId, name: m.user.name || m.user.email }))
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Members list error:', error.message);
    } else {
      console.error('Members list error:', error);
    }
    return NextResponse.json({ error: 'Unauthorized or failed' }, { status: 401 });
  }
}
