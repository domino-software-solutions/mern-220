'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email?: string;
  name?: string;
  role?: string;
}

interface Seminar {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: number;
}

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/user');
      if (!response.ok) {
        router.push('/login');
      } else {
        const userData = await response.json();
        if (userData.user.role !== 'agent') {
          router.push('/dashboard');
        } else {
          setUser(userData.user);
          setLoading(false);
          // Fetch seminars data here
          // For now, we'll use mock data
          setSeminars([
            { id: '1', title: 'Understanding Life Insurance', date: '2023-07-15', time: '14:00', attendees: 25 },
            { id: '2', title: 'Retirement Planning 101', date: '2023-07-22', time: '15:00', attendees: 30 },
          ]);
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateSeminar = () => {
    // Implement seminar creation logic
    console.log('Create new seminar');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Agent Dashboard</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-4">Welcome, {user?.name || user?.email || 'Agent'}!</p>
        <h2 className="text-xl font-semibold mb-3">Your Upcoming Seminars:</h2>
        <ul className="mb-4">
          {seminars.map((seminar) => (
            <li key={seminar.id} className="mb-2 p-2 border rounded">
              <h3 className="font-semibold">{seminar.title}</h3>
              <p>Date: {seminar.date}</p>
              <p>Time: {seminar.time}</p>
              <p>Attendees: {seminar.attendees}</p>
            </li>
          ))}
        </ul>
        <button
          onClick={handleCreateSeminar}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create New Seminar
        </button>
      </div>
    </div>
  );
}
