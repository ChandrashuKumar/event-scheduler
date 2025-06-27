import { auth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    const firebaseUID = decoded.uid;

    const user = await prisma.user.findUnique({
      where: { firebaseUID },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: {
        group: true,
      },
    });

    const groups = memberships.map((m) => m.group);

    return NextResponse.json(groups);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
