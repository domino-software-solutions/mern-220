import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { withAuth } from '@/middleware/authMiddleware';
import twilio from 'twilio';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = twilio(accountSid, authToken);

async function handler(req: NextRequest & { user: { userId: string } }) {
  console.log('RSVP handler called');
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { invitationId, response } = await req.json();
    console.log('RSVP request body:', { invitationId, response });
    const db = await getDatabase();
    const seminarsCollection = db.collection('seminars');
    const usersCollection = db.collection('users');

    // Get the user ID from the authenticated request
    const userId = req.user.userId;

    console.log('Processing RSVP:', { invitationId, response, userId });

    const seminar = await seminarsCollection.findOne({ _id: new ObjectId(invitationId) });

    if (!seminar) {
      console.log('Seminar not found:', invitationId);
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    if (!seminar.invitees.includes(userId)) {
      console.log('User not invited:', userId);
      return NextResponse.json({ error: 'User not invited to this seminar' }, { status: 403 });
    }

    if (response === 'accept') {
      console.log('Accepting invitation');
      if (seminar.attendees && seminar.attendees.length >= seminar.capacity) {
        console.log('Seminar is full');
        return NextResponse.json({ error: 'Seminar is full' }, { status: 400 });
      }

      const updateResult = await seminarsCollection.updateOne(
        { _id: new ObjectId(invitationId) },
        { 
          $addToSet: { attendees: userId },
          $pull: { invitees: userId }
        }
      );

      console.log('Seminar update result:', updateResult);

      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { registeredSeminars: new ObjectId(invitationId) } }
      );

      // Fetch user details for SMS
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      console.log('User details:', user);

      if (user && user.phoneNumber) {
        console.log('About to send SMS confirmation for user:', user._id);
        await sendSmsConfirmation(user.phoneNumber, seminar);
      } else {
        console.log('SMS not sent: User has no phone number or user not found');
      }

      return NextResponse.json({ message: 'Successfully accepted invitation' });
    } else if (response === 'decline') {
      const updateResult = await seminarsCollection.updateOne(
        { _id: new ObjectId(invitationId) },
        { $pull: { invitees: userId } }
      );

      console.log('Seminar update result:', updateResult);

      return NextResponse.json({ message: 'Successfully declined invitation' });
    } else {
      console.log('Invalid response:', response);
      return NextResponse.json({ error: 'Invalid response' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json({ error: 'Failed to process RSVP', details: (error as Error).message }, { status: 500 });
  }
}

async function sendSmsConfirmation(phoneNumber: string, seminar: { title: string; date: string; time: string }) {
  console.log('Attempting to send SMS confirmation');
  console.log('Phone number:', phoneNumber);
  console.log('Seminar details:', seminar);

  // Check if the phone number is the verified trial number
  const verifiedTrialNumber = '+19402933160';  // The number you verified with Twilio
  
  // Normalize the phone number by adding '+1' if it's not already there
  const normalizedPhoneNumber = phoneNumber.startsWith('+1') ? phoneNumber : `+1${phoneNumber}`;

  if (normalizedPhoneNumber !== verifiedTrialNumber) {
    console.log('SMS not sent: Phone number not verified for trial account');
    return;
  }

  console.log('Twilio credentials:', { accountSid, authToken: authToken ? 'set' : 'not set', twilioPhoneNumber });

  try {
    const message = await twilioClient.messages.create({
      body: `Your attendance for "${seminar.title}" on ${seminar.date} at ${seminar.time} has been confirmed. We look forward to seeing you!`,
      from: twilioPhoneNumber,
      to: verifiedTrialNumber  // Always send to the verified number in trial mode
    });
    console.log('SMS sent successfully:', message.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

export const POST = withAuth(handler, ['attendee']);
