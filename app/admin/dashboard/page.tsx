'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface Seminar {
  id: string;
  title: string;
  date: string;
  time: string;
  agent: string;
  attendees: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [attendees, setAttendees] = useState<User[]>([]);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/user');
      if (!response.ok) {
        router.push('/login');
      } else {
        const userData = await response.json();
        if (userData.user.role !== 'admin') {
          router.push('/dashboard');
        } else {
          setUser(userData.user);
          setLoading(false);
          // Fetch actual data from your API endpoints
          fetchAgents();
          fetchAttendees();
          fetchSeminars();
        }
      }
    };

    checkAuth();
  }, [router]);

  const fetchAgents = async () => {
    // Replace with actual API call
    const response = await fetch('/api/agents');
    if (response.ok) {
      const data = await response.json();
      setAgents(data.agents);
    }
  };

  const fetchAttendees = async () => {
    // Replace with actual API call
    const response = await fetch('/api/attendees');
    if (response.ok) {
      const data = await response.json();
      setAttendees(data.attendees);
    }
  };

  const fetchSeminars = async () => {
    // Replace with actual API call
    const response = await fetch('/api/seminars');
    if (response.ok) {
      const data = await response.json();
      setSeminars(data.seminars);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>
      {user && (
        <p className="mb-4">Welcome, {user.firstName || user.email}!</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-3">Agents</h2>
          <ul className="divide-y divide-gray-200">
            {agents.map((agent) => (
              <li key={agent.id} className="py-2">
                {agent.firstName} {agent.lastName} - {agent.email}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-3">Attendees</h2>
          <ul className="divide-y divide-gray-200">
            {attendees.map((attendee) => (
              <li key={attendee.id} className="py-2">
                {attendee.firstName} {attendee.lastName} - {attendee.email}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-3">Upcoming Seminars</h2>
        <ul className="divide-y divide-gray-200">
          {seminars.map((seminar) => (
            <li key={seminar.id} className="py-2">
              <h3 className="font-semibold">{seminar.title}</h3>
              <p>Date: {seminar.date} | Time: {seminar.time}</p>
              <p>Agent: {seminar.agent} | Attendees: {seminar.attendees}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
