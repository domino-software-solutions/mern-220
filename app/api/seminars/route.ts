import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';
import Seminar from '@/app/models/Seminar';

async function handler(req: NextRequest) {
  const db = await getDatabase();
  const seminarsCollection = db.collection('seminars');

  if (req.method === 'POST') {
    try {
      const { title, date, time, description, capacity, price, invitees } = await req.json();
      
      // Parse capacity and price as numbers
      const parsedCapacity = parseInt(capacity, 10);
      const parsedPrice = parseFloat(price);

      if (isNaN(parsedCapacity) || isNaN(parsedPrice)) {
        return NextResponse.json({ error: 'Invalid capacity or price' }, { status: 400 });
      }

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

      const agentId = decodedToken.userId;

      if (!agentId) {
        return NextResponse.json({ error: 'User ID is missing from the token' }, { status: 401 });
      }

      const newSeminar = new Seminar({
        title,
        date,
        time,
        description,
        capacity: parsedCapacity,
        price: parsedPrice,
        agentId: new ObjectId(agentId).toString(),
        invitees: invitees || [],
      });

      const result = await seminarsCollection.insertOne(newSeminar);
      return NextResponse.json({ message: 'Seminar created successfully', seminarId: result.insertedId }, { status: 201 });
    } catch (error) {
      console.error('Error creating seminar:', error);
      return NextResponse.json({ error: 'Failed to create seminar' }, { status: 500 });
    }
  }

  if (req.method === 'GET') {
    try {
      const seminars = await seminarsCollection.find({}).toArray();
      return NextResponse.json(seminars);
    } catch (error) {
      console.error('Error fetching seminars:', error);
      return NextResponse.json({ error: 'Failed to fetch seminars' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler, ['agent', 'attendee', 'admin']);
export const POST = withAuth(handler, ['agent']);
