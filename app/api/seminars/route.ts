import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { withAuth } from '@/middleware/authMiddleware';
import Seminar from '@/app/models/Seminar';

async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    try {
      const db = await getDatabase();
      const seminars = await db.collection('seminars').find().toArray();
      return NextResponse.json({ seminars });
    } catch (error) {
      console.error('Error fetching seminars:', error);
      return NextResponse.json({ error: 'Failed to fetch seminars' }, { status: 500 });
    }
  } else if (req.method === 'POST') {
    try {
      const db = await getDatabase();
      const seminarsCollection = db.collection('seminars');
      const { title, date, time, description, capacity, price } = await req.json();

      if (!title || !date || !time || !description || !capacity || !price) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const token = req.cookies.get('token')?.value;
      if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      const decoded = JSON.parse(atob(token.split('.')[1]));
      const agentId = decoded.userId;

      const newSeminar = new Seminar({
        title,
        date,
        time,
        description,
        capacity: Number(capacity),
        price: Number(price),
        agentId,
      });

      const result = await seminarsCollection.insertOne(newSeminar);

      if (result.acknowledged) {
        return NextResponse.json({ message: 'Seminar created successfully', seminarId: result.insertedId });
      } else {
        return NextResponse.json({ error: 'Failed to create seminar' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error creating seminar:', error);
      return NextResponse.json({ error: 'An unexpected error occurred', details: (error as Error).message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
}

export const GET = withAuth(handler, ['admin', 'agent', 'attendee']);
export const POST = withAuth(handler, ['agent']);
