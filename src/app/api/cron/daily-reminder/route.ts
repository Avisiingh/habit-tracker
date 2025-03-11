import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all users who haven't checked in today
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { lastCheckIn: null },
          {
            lastCheckIn: {
              lt: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        ]
      }
    });

    return NextResponse.json({ 
      message: `Found ${users.length} users who haven't checked in today`,
      users: users.map(u => ({ id: u.id, name: u.name }))
    });
  } catch (error) {
    console.error('Error in daily reminder:', error);
    return NextResponse.json(
      { error: 'Failed to process daily reminders' },
      { status: 500 }
    );
  }
} 