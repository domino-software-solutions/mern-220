'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Invitation {
  _id: string;
  title: string;
  date: string;
  time: string;
  description: string;
}

export default function InvitationDetails() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await fetch(`/api/invitations/${id}`);
        if (response.ok) {
          const data = await response.json();
          setInvitation(data);
        } else {
          console.error('Failed to fetch invitation details');
        }
      } catch (error) {
        console.error('Error fetching invitation details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [id]);

  const handleRSVP = async (response: 'accept' | 'decline') => {
    try {
      const apiResponse = await fetch('/api/invitations/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: id, response }),
      });

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        alert(`You have ${response}ed the invitation.`);
        router.push('/attendee/dashboard');
      } else {
        console.error('RSVP error:', data);
        alert(data.error || 'Failed to process RSVP');
      }
    } catch (error) {
      console.error('Error processing RSVP:', error);
      alert('An error occurred while processing your RSVP');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!invitation) {
    return <div>Invitation not found</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">{invitation.title}</h1>
      <p>Date: {invitation.date}</p>
      <p>Time: {invitation.time}</p>
      <p className="mt-4">{invitation.description}</p>
      <div className="mt-8 space-x-4">
        <button
          onClick={() => handleRSVP('accept')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Accept
        </button>
        <button
          onClick={() => handleRSVP('decline')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
