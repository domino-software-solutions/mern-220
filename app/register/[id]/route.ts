import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');

    const seminarId = params.id;
    console.log('Fetching seminar with ID:', seminarId);

    if (!ObjectId.isValid(seminarId)) {
      console.log('Invalid seminar ID:', seminarId);
      return NextResponse.json({ error: 'Invalid seminar ID' }, { status: 400 });
    }

    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(seminarId) });

    if (!seminar) {
      console.log('Seminar not found');
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    // Create a new object without sensitive information
    const sanitizedSeminar = { ...seminar };
    delete sanitizedSeminar.invitees;

    console.log('Seminar found:', sanitizedSeminar);
    return NextResponse.json(sanitizedSeminar);
  } catch (error) {
    console.error('Error fetching seminar:', error);
    return NextResponse.json({ error: 'Failed to fetch seminar', details: (error as Error).message }, { status: 500 });
  }
}

async function postHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');
    const usersCollection = db.collection('users');

    const seminarId = params.id;
    console.log('Registering for seminar with ID:', seminarId);

    if (!ObjectId.isValid(seminarId)) {
      console.log('Invalid seminar ID:', seminarId);
      return NextResponse.json({ error: 'Invalid seminar ID' }, { status: 400 });
    }

    const token = request.cookies.get('token')?.value;
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

    const userId = decodedToken.userId;

    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(seminarId) });

    if (!seminar) {
      console.log('Seminar not found');
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    console.log('Seminar details:', seminar);
    console.log('Current attendees:', seminar.attendees);
    console.log('Seminar capacity:', seminar.capacity);

    if (seminar.attendees.length >= seminar.capacity) {
      console.log('Seminar is full');
      return NextResponse.json({ error: 'Seminar is full' }, { status: 400 });
    }

    console.log('User ID:', userId);
    console.log('Attendees includes user:', seminar.attendees.includes(userId));

    if (seminar.attendees.includes(userId)) {
      console.log('User already registered');
      return NextResponse.json({ error: 'Already registered for this seminar' }, { status: 400 });
    }

    console.log('Invitees:', seminar.invitees);
    console.log('Invitees includes user:', seminar.invitees.includes(userId));

    // Check if the user is invited or if the seminar is open for public registration
    if (seminar.invitees.length > 0 && !seminar.invitees.includes(userId)) {
      console.log('User not invited to this seminar');
      return NextResponse.json({ error: 'You are not invited to this seminar' }, { status: 403 });
    }

    const updateResult = await seminarsCollection.updateOne(
      { _id: new ObjectId(seminarId) },
      { 
        $addToSet: { attendees: userId },
        $pull: { invitees: userId }
      }
    );

    console.log('Update result:', updateResult);

    if (updateResult.modifiedCount === 0) {
      console.log('Seminar update failed');
      return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
    }

    const userUpdateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { registeredSeminars: new ObjectId(seminarId) } }
    );

    console.log('User update result:', userUpdateResult);

    console.log('User successfully registered for seminar');
    return NextResponse.json({ message: 'Successfully registered for seminar' });
  } catch (error) {
    console.error('Error registering for seminar:', error);
    return NextResponse.json({ error: 'Failed to register for seminar', details: (error as Error).message }, { status: 500 });
  }
}

export const POST = withAuth(postHandler as (req: NextRequest) => Promise<NextResponse>);
