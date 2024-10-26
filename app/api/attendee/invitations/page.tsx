'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Invitation {
  _id: string;
  title: string;
  date: string;
  time: string;
}

export default function AttendeeInvitations() {
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [confirmedRSVPs, setConfirmedRSVPs] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const [pendingResponse, confirmedResponse] = await Promise.all([
          fetch('/api/invitations'),
          fetch('/api/attendee/confirmed-seminars')
        ]);

        if (!pendingResponse.ok || !confirmedResponse.ok) {
          throw new Error('Failed to fetch invitations or confirmed RSVPs');
        }

        const [pendingData, confirmedData] = await Promise.all([
          pendingResponse.json(),
          confirmedResponse.json()
        ]);

        setPendingInvitations(pendingData);
        setConfirmedRSVPs(confirmedData);
      } catch (error) {
        console.error('Error fetching invitations:', error);
        setError('Failed to fetch invitations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Your Invitations</h1>
      
      <h2 className="text-2xl font-semibold mb-3">Pending Invitations:</h2>
      {pendingInvitations.length > 0 ? (
        <ul className="space-y-4 mb-8">
          {pendingInvitations.map((invitation) => (
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
        <p className="mb-8">You have no pending invitations.</p>
      )}

      <h2 className="text-2xl font-semibold mb-3">Confirmed RSVPs:</h2>
      {confirmedRSVPs.length > 0 ? (
        <ul className="space-y-4">
          {confirmedRSVPs.map((seminar) => (
            <li key={seminar._id} className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold">{seminar.title}</h3>
              <p>Date: {seminar.date}</p>
              <p>Time: {seminar.time}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no confirmed RSVPs.</p>
      )}
    </div>
  );
}
