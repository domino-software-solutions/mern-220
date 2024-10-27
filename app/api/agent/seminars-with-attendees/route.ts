import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId, Collection } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

interface Seminar {
  _id: ObjectId;
  title: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  attendees: string[];
  confirmedAttendees: string[];
  // Add any other fields your seminar document has
}

interface Attendee {
  _id: ObjectId;
  name: string;
  email: string;
}

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const db = await getDatabase();
    const seminarsCollection: Collection<Seminar> = db.collection('seminars');
    const usersCollection: Collection<Attendee> = db.collection('users');

    const seminars = await seminarsCollection.find({}).toArray();

    const seminarsWithAttendees = await Promise.all(seminars.map(async (seminar: Seminar) => {
      const attendeeIds = seminar.attendees || [];
      const attendees = attendeeIds.length > 0 
        ? await usersCollection.find(
            { _id: { $in: attendeeIds.map((id: string) => new ObjectId(id)) } },
            { projection: { name: 1, email: 1 } }
          ).toArray()
        : [];

      return {
        ...seminar,
        attendees: attendees.map((attendee: Attendee) => ({
          ...attendee,
          confirmed: true  // All attendees are considered confirmed for now
        }))
      };
    }));

    return NextResponse.json(seminarsWithAttendees);
  } catch (error) {
    console.error('Error fetching seminars with attendees:', error);
    return NextResponse.json({ error: 'Failed to fetch seminars with attendees' }, { status: 500 });
  }
}

export const GET = withAuth(handler, ['agent']);
