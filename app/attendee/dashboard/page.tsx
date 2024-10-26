'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email?: string;
  firstName?: string;
  role?: string;
}

export default function AttendeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [rsvp, setRsvp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/user');
      if (!response.ok) {
        router.push('/login');
      } else {
        const userData = await response.json();
        if (userData.user.role !== 'attendee') {
          router.push('/dashboard');
        } else {
          setUser(userData.user);
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleRSVP = async () => {
    setRsvp(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Attendee Dashboard</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-4">Welcome, {user?.firstName || user?.email || 'Guest'}!</p>
        <h2 className="text-xl font-semibold mb-3">Upcoming Seminar Details:</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Date: July 15, 2023</li>
          <li>Time: 2:00 PM - 4:00 PM</li>
          <li>Location: Virtual (Zoom link will be provided)</li>
          <li>Topic: Understanding Life Insurance Policies</li>
        </ul>
        {!rsvp ? (
          <button
            onClick={handleRSVP}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            RSVP Now
          </button>
        ) : (
          <p className="text-green-600 font-semibold">You have successfully RSVP&apos;d for the seminar!</p>
        )}
      </div>
    </div>
  );
}
