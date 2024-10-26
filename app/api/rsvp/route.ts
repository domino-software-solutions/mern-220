import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const dbName = process.env.MONGODB_DB_NAME || "mern-220";

export async function POST(request: NextRequest) {
  try {
    const { userId, eventName, attendees } = await request.json();
    
    if (!userId || !eventName || !attendees) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clientPromise = await getClientPromise();
    const client = await clientPromise;
    const db = client.db(dbName);

    const result = await db.collection("rsvps").insertOne({
      userId: new ObjectId(userId),
      eventName,
      attendees,
      createdAt: new Date()
    });

    return NextResponse.json({ message: 'RSVP submitted successfully', rsvpId: result.insertedId }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}
