import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { withAuth } from '@/middleware/authMiddleware';

async function handler(req: NextRequest & { user: { userId: string } }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');
    const userId = req.user.userId;

    const confirmedSeminars = await seminarsCollection.find(
      { attendees: userId },
      { projection: { title: 1, date: 1, time: 1 } }
    ).toArray();

    return NextResponse.json(confirmedSeminars);
  } catch (error) {
    console.error('Error fetching confirmed seminars:', error);
    return NextResponse.json({ error: 'Failed to fetch confirmed seminars' }, { status: 500 });
  }
}

export const GET = withAuth(handler, ['attendee']);
