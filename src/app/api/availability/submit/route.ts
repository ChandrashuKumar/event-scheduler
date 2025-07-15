import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    const firebaseUID = decoded.uid;

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUID },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { groupId, startDateTime, endDateTime } = await req.json();

    if (!groupId || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const created = await prisma.availability.create({
      data: {
        userId: dbUser.id,
        groupId,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
      },
    });

    return NextResponse.json({ success: true, availability: created });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Availability submit error:', error.message);
    } else {
      console.error('Availability submit error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
