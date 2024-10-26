import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

async function handler(req: NextRequest & { user: { userId: string } }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { invitationId, response } = await req.json();
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');
    const usersCollection = db.collection('users');

    // Get the user ID from the authenticated request
    const userId = req.user.userId;

    console.log('Processing RSVP:', { invitationId, response, userId });

    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(invitationId) });

    if (!seminar) {
      console.log('Seminar not found:', invitationId);
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    if (!seminar.invitees.includes(userId)) {
      console.log('User not invited:', userId);
      return NextResponse.json({ error: 'User not invited to this seminar' }, { status: 403 });
    }

    if (response === 'accept') {
      if (seminar.attendees && seminar.attendees.length >= seminar.capacity) {
        console.log('Seminar is full');
        return NextResponse.json({ error: 'Seminar is full' }, { status: 400 });
      }

      const updateResult = await seminarsCollection.updateOne(
        { _id: new ObjectId(invitationId) },
        { 
          $addToSet: { attendees: userId },
          $pull: { invitees: userId }
        }
      );

      console.log('Seminar update result:', updateResult);

      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { registeredSeminars: new ObjectId(invitationId) } }
      );

      return NextResponse.json({ message: 'Successfully accepted invitation' });
    } else if (response === 'decline') {
      const updateResult = await seminarsCollection.updateOne(
        { _id: new ObjectId(invitationId) },
        { $pull: { invitees: userId } }
      );

      console.log('Seminar update result:', updateResult);

      return NextResponse.json({ message: 'Successfully declined invitation' });
    } else {
      console.log('Invalid response:', response);
      return NextResponse.json({ error: 'Invalid response' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json({ error: 'Failed to process RSVP', details: (error as Error).message }, { status: 500 });
  }
}

export const POST = withAuth(handler, ['attendee']);
