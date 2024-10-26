'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Invitation {
  _id: string;
  seminarTitle: string;
  date: string;
  time: string;
}

export default function AttendeeInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch('/api/invitations');
        if (response.ok) {
          const data = await response.json();
          setInvitations(data);
        } else {
          console.error('Failed to fetch invitations');
        }
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleRSVP = async (invitationId: string, response: 'accept' | 'decline') => {
    try {
      const apiResponse = await fetch('/api/invitations/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, response }),
      });

      if (apiResponse.ok) {
        // Refresh the invitations list or update the UI
        const updatedInvitations = invitations.filter(inv => inv._id !== invitationId);
        setInvitations(updatedInvitations);
        
        // Use router to navigate to a confirmation page or refresh the current page
        if (response === 'accept') {
          router.push(`/attendee/seminar/${invitationId}`);
        } else {
          router.refresh();
        }
      } else {
        const errorData = await apiResponse.json();
        alert(errorData.error || 'Failed to process RSVP');
      }
    } catch (error) {
      console.error('Error processing RSVP:', error);
      alert('An error occurred while processing your RSVP');
    }
  };

  if (loading) {
    return <div>Loading invitations...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Your Invitations</h1>
      {invitations.length > 0 ? (
        <ul className="space-y-4">
          {invitations.map((invitation) => (
            <li key={invitation._id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold">{invitation.seminarTitle}</h2>
              <p>Date: {invitation.date}</p>
              <p>Time: {invitation.time}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleRSVP(invitation._id, 'accept')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRSVP(invitation._id, 'decline')}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no pending invitations.</p>
      )}
    </div>
  );
}
