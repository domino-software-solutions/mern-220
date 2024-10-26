import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');

    const seminarId = params.id;
    if (!ObjectId.isValid(seminarId)) {
      return NextResponse.json({ error: 'Invalid seminar ID' }, { status: 400 });
    }

    const seminar = await seminarsCollection.findOne(
      { _id: new ObjectId(seminarId) },
      { projection: { title: 1, date: 1, time: 1, description: 1 } }
    );

    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    return NextResponse.json(seminar);
  } catch (error) {
    console.error('Error fetching invitation details:', error);
    return NextResponse.json({ error: 'Failed to fetch invitation details' }, { status: 500 });
  }
}

export const GET = withAuth(async (req: NextRequest) => {
  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'Invalid invitation ID' }, { status: 400 });
  }
  return handler(req, { params: { id } });
}, ['attendee']);
