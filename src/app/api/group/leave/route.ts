import { auth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    const firebaseUID = decoded.uid;

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUID },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { groupId } = await req.json();

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Step 1: Delete availability entries
    await prisma.availability.deleteMany({
      where: {
        userId: dbUser.id,
        groupId,
      },
    });

    // Step 2: Remove from group
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: dbUser.id,
          groupId,
        },
      },
    });

    // Step 3: Check if group has 0 members left, and delete if so
    const remainingMembers = await prisma.groupMember.count({
      where: { groupId },
    });

    if (remainingMembers === 0) {
      await prisma.group.delete({
        where: { id: groupId },
      });
    }

    return NextResponse.json({ message: 'Left group', groupName: group.name });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Group leave error:', error.message);
    } else {
      console.error('Group leave error:', error);
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
