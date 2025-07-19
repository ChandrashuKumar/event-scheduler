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

    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const existingGroup = await prisma.group.findFirst({
      where: {
        name,
        createdBy: firebaseUID,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'You already have a group with this name' },
        { status: 409 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        createdBy: firebaseUID,
      },
    });

    await prisma.groupMember.create({
      data: {
        userId: dbUser.id,
        groupId: group.id,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Group creation error:', error.message);
    } else {
      console.error('Group creation error:', error);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
