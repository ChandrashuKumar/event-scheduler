import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { availabilityId } = await req.json();
  try {
    await prisma.availability.delete({
      where: {
        id: availabilityId,
      },
    });

    return NextResponse.json({ message: 'Availability deleted' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Delete availability error:', error.message);
    } else {
      console.error('Delete availability error:', error);
    }
    return NextResponse.json({ error: 'Failed to delete availability' }, { status: 500 });
  }
}
