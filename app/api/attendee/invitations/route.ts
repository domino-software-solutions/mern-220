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

    const invitations = await seminarsCollection.find(
      { invitees: userId },
      { projection: { title: 1, date: 1, time: 1 } }
    ).toArray();

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export const GET = withAuth(handler, ['attendee']);
