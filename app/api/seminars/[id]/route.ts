import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

async function handler(req: NextRequest, context: { params: { id: string } }) {
  console.log('Received DELETE request for seminar ID:', context.params.id);

  if (req.method !== 'DELETE') {
    console.log('Method not allowed:', req.method);
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');

    const seminarId = context.params.id;
    console.log('Attempting to delete seminar with ID:', seminarId);

    if (!ObjectId.isValid(seminarId)) {
      console.log('Invalid seminar ID:', seminarId);
      return NextResponse.json({ error: 'Invalid seminar ID' }, { status: 400 });
    }

    const result = await seminarsCollection.deleteOne({ _id: new ObjectId(seminarId) });
    console.log('Delete operation result:', result);

    if (result.deletedCount === 0) {
      console.log('Seminar not found for deletion');
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    console.log('Seminar deleted successfully');
    return NextResponse.json({ message: 'Seminar deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting seminar:', error);
    return NextResponse.json({ error: 'Failed to delete seminar', details: (error as Error).message }, { status: 500 });
  }
}

export const DELETE = withAuth(async (req: NextRequest) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  return handler(req, { params: { id } });
});
