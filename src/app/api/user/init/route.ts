// src/app/api/user/init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);

    const firebaseUID = decoded.uid;
    const email = decoded.email ?? '';
    const name = decoded.name ?? '';

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { firebaseUID },
    });

    // If not, create
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUID,
          email,
          name,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('User init error:', error.message);
    } else {
      console.error('User init error:', error);
    }
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
