'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Invitation {
  _id: string;
  title: string;
  date: string;
  time: string;
}

interface ConfirmedSeminar {
  _id: string;
  title: string;
  date: string;
  time: string;
}

export default function AttendeeDashboard() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [confirmedSeminars, setConfirmedSeminars] = useState<ConfirmedSeminar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invitationsResponse, confirmedSeminarsResponse] = await Promise.all([
          fetch('/api/invitations'),
          fetch('/api/attendee/confirmed-seminars')
        ]);

        if (invitationsResponse.ok && confirmedSeminarsResponse.ok) {
          const [invitationsData, confirmedSeminarsData] = await Promise.all([
            invitationsResponse.json(),
            confirmedSeminarsResponse.json()
          ]);
          setInvitations(invitationsData);
          setConfirmedSeminars(confirmedSeminarsData);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Attendee Dashboard</h1>
      
      <h2 className="text-2xl font-semibold mb-3">Your Invitations:</h2>
      {invitations.length > 0 ? (
        <ul className="space-y-4 mb-8">
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
        <p className="mb-8">You have no pending invitations.</p>
      )}

      <h2 className="text-2xl font-semibold mb-3">Your Confirmed Seminars:</h2>
      {confirmedSeminars.length > 0 ? (
        <ul className="space-y-4">
          {confirmedSeminars.map((seminar) => (
            <li key={seminar._id} className="bg-white shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold">{seminar.title}</h3>
              <p>Date: {seminar.date}</p>
              <p>Time: {seminar.time}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no confirmed seminars.</p>
      )}
    </div>
  );
}
