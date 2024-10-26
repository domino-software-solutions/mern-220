import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { seminarId } = await req.json();
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

    if (!attendeeId) {
      return NextResponse.json({ error: 'User ID is missing from the token' }, { status: 401 });
    }

    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');
    const usersCollection = db.collection('users');

    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(seminarId) });

    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    if (seminar.attendees.length >= seminar.capacity) {
      return NextResponse.json({ error: 'Seminar is full' }, { status: 400 });
    }

    if (seminar.attendees.includes(attendeeId)) {
      return NextResponse.json({ error: 'Already registered for this seminar' }, { status: 400 });
    }

    // Check if the user is invited or if the seminar is open for public registration
    if (seminar.invitees.length > 0 && !seminar.invitees.includes(attendeeId)) {
      return NextResponse.json({ error: 'You are not invited to this seminar' }, { status: 403 });
    }

    const updateResult = await seminarsCollection.updateOne(
      { _id: new ObjectId(seminarId) },
      { 
        $addToSet: { attendees: attendeeId },
        $pull: { invitees: attendeeId }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(attendeeId) },
      { $addToSet: { registeredSeminars: new ObjectId(seminarId) } }
    );

    return NextResponse.json({ message: 'Successfully registered for seminar' }, { status: 200 });
  } catch (error) {
    console.error('Error registering for seminar:', error);
    return NextResponse.json({ error: 'Failed to register for seminar' }, { status: 500 });
  }
}

export const POST = withAuth(handler, ['attendee']);
