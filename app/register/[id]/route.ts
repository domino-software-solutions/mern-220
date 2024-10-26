import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    console.log('Seminar found:', seminar);
    return NextResponse.json(seminar);
  } catch (error) {
    console.error('Error fetching seminar:', error);
    return NextResponse.json({ error: 'Failed to fetch seminar', details: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get user information from the session (implement your own auth logic)
    const userId = 'user_id_from_session';

    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(seminarId) });

    if (!seminar) {
      console.log('Seminar not found');
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    if (seminar.attendees.length >= seminar.capacity) {
      console.log('Seminar is full');
      return NextResponse.json({ error: 'Seminar is full' }, { status: 400 });
    }

    const updateResult = await seminarsCollection.updateOne(
      { _id: new ObjectId(seminarId) },
      { $addToSet: { attendees: userId } }
    );

    if (updateResult.modifiedCount === 0) {
      console.log('User already registered or seminar update failed');
      return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { registeredSeminars: new ObjectId(seminarId) } }
    );

    console.log('User successfully registered for seminar');
    return NextResponse.json({ message: 'Successfully registered for seminar' });
  } catch (error) {
    console.error('Error registering for seminar:', error);
    return NextResponse.json({ error: 'Failed to register for seminar', details: (error as Error).message }, { status: 500 });
  }
}
