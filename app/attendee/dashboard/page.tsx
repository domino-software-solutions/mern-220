'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Invitation {
  _id: string;
  title: string;
  date: string;
  time: string;
}

export default function AttendeeDashboard() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Router:', router); // Debug log for router

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
  }, [router]); // Added router to dependency array

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Attendee Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-3">Your Invitations:</h2>
      {invitations.length > 0 ? (
        <ul className="space-y-4">
          {invitations.map((invitation) => (
            <li key={invitation._id} className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold">{invitation.title}</h3>
              <p>Date: {invitation.date}</p>
              <p>Time: {invitation.time}</p>
              <Link href={`/attendee/invitations/${invitation._id}`} className="text-blue-500 hover:underline">
                View Details and RSVP
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no pending invitations.</p>
      )}
    </div>
  );
}
