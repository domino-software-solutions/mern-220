import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

async function handler(req: NextRequest): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { seminarId, response } = await req.json();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const attendeeId = decodedToken.userId;
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');
    const usersCollection = db.collection('users');

    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(seminarId) });

    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    if (!seminar.invitees.includes(attendeeId)) {
      return NextResponse.json({ error: 'You are not invited to this seminar' }, { status: 403 });
    }

    if (response === 'accept') {
      if (seminar.attendees.length >= seminar.capacity) {
        return NextResponse.json({ error: 'Seminar is full' }, { status: 400 });
      }

      const updateResult = await seminarsCollection.updateOne(
        { _id: new ObjectId(seminarId) },
        { 
          $addToSet: { attendees: attendeeId, confirmedAttendees: attendeeId },
          $pull: { invitees: attendeeId }
        }
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json({ error: 'RSVP failed' }, { status: 400 });
      }

      await usersCollection.updateOne(
        { _id: new ObjectId(attendeeId) },
        { $addToSet: { registeredSeminars: new ObjectId(seminarId) } }
      );

      return NextResponse.json({ message: 'Successfully accepted invitation' }, { status: 200 });
    } else if (response === 'decline') {
      const updateResult = await seminarsCollection.updateOne(
        { _id: new ObjectId(seminarId) },
        { $pull: { invitees: attendeeId } }
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json({ error: 'RSVP failed' }, { status: 400 });
      }

      return NextResponse.json({ message: 'Successfully declined invitation' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid RSVP response' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json({ error: 'Failed to process RSVP' }, { status: 500 });
  }
}

export const POST = withAuth(handler, ['attendee']);
