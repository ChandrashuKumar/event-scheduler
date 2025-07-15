import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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

    const groupId = req.nextUrl.searchParams.get('groupId');
    if (!groupId) {
      return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: {
        userId: dbUser.id,
        groupId,
      },
      orderBy: {
        startDateTime: 'asc', // Order by new datetime field
      },
    });

    return NextResponse.json(availability);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Availability fetch error:', error.message);
    } else {
      console.error('Availability fetch error:', error);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
