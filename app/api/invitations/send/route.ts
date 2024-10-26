import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { seminarId, attendeeEmails } = await req.json();
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');
    const usersCollection = db.collection('users');

    // Verify the seminar exists
    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(seminarId) });
    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    // Find attendees by email
    const attendees = await usersCollection.find({ email: { $in: attendeeEmails }, role: 'attendee' }).toArray();
    const attendeeIds = attendees.map((attendee: { _id: ObjectId }) => attendee._id.toString());

    // Update the seminar with new invitees
    await seminarsCollection.updateOne(
      { _id: new ObjectId(seminarId) },
      { $addToSet: { invitees: { $each: attendeeIds } } }
    );

    return NextResponse.json({ message: 'Invitations sent successfully' });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 });
  }
}

export const POST = withAuth(handler, ['agent']);
