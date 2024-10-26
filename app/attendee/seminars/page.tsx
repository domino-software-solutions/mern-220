'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Seminar {
  _id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  price: number;
  attendees: string[];
}

export default function AttendeeSeminars() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          router.push('/login');
        } else {
          const userData = await response.json();
          if (userData.user.role !== 'attendee') {
            router.push('/dashboard');
          } else {
            fetchSeminars();
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchSeminars = async () => {
    try {
      const response = await fetch('/api/seminars');
      if (response.ok) {
        const data = await response.json();
        setSeminars(data);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (seminarId: string) => {
    try {
      const response = await fetch('/api/seminars/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seminarId }),
      });
      if (response.ok) {
        fetchSeminars();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to register for seminar');
      }
    } catch (error) {
      console.error('Error registering for seminar:', error);
      alert('An error occurred while registering for the seminar');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Available Seminars</h1>
      <ul className="mb-4">
        {seminars.map((seminar) => (
          <li key={seminar._id} className="mb-2 p-2 border rounded">
            <h3 className="font-semibold">{seminar.title}</h3>
            <p>Date: {seminar.date}</p>
            <p>Time: {seminar.time}</p>
            <p>Description: {seminar.description}</p>
            <p>Attendees: {seminar.attendees.length} / {seminar.capacity}</p>
            <p>Price: ${seminar.price}</p>
            <button
              onClick={() => handleRegister(seminar._id)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
              disabled={seminar.attendees.length >= seminar.capacity}
            >
              {seminar.attendees.length >= seminar.capacity ? 'Full' : 'Register'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
