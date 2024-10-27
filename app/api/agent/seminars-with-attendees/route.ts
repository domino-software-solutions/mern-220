import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId, Collection } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    role: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>,
  allowedRoles: string[] = []
) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      // Add the decoded token to the request object
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = decoded;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Error in auth middleware:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
}

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

async function handler(req: AuthenticatedRequest) {
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
