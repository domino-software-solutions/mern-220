'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email?: string;
  name?: string;
  role?: string;
}

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

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [newSeminar, setNewSeminar] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    capacity: 0,
    price: 0,
  });
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
          fetchSeminars();
        }
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
    }
  };

  const handleCreateSeminar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/seminars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeminar),
      });
      if (response.ok) {
        setNewSeminar({
          title: '',
          date: '',
          time: '',
          description: '',
          capacity: 0,
          price: 0,
        });
        fetchSeminars();
      }
    } catch (error) {
      console.error('Error creating seminar:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Agent Dashboard</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-4">Welcome, {user?.name || user?.email || 'Agent'}!</p>
        
        <h2 className="text-xl font-semibold mb-3">Create New Seminar</h2>
        <form onSubmit={handleCreateSeminar} className="mb-6">
          {/* Add form inputs for newSeminar fields */}
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create Seminar
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-3">Your Seminars:</h2>
        <ul className="mb-4">
          {seminars.map((seminar) => (
            <li key={seminar._id} className="mb-2 p-2 border rounded">
              <h3 className="font-semibold">{seminar.title}</h3>
              <p>Date: {seminar.date}</p>
              <p>Time: {seminar.time}</p>
              <p>Attendees: {seminar.attendees.length} / {seminar.capacity}</p>
              <p>Price: ${seminar.price}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
