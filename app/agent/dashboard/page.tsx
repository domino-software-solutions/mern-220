'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import InvitationForm from '../../components/InvitationForm';

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
  qrCode?: string;
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
    capacity: '',
    price: '',
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
      } else {
        console.error('Failed to fetch seminars:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSeminar(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSeminar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedSeminar = {
        ...newSeminar,
        capacity: parseInt(newSeminar.capacity, 10),
        price: parseFloat(newSeminar.price)
      };

      if (isNaN(formattedSeminar.capacity) || isNaN(formattedSeminar.price)) {
        alert('Please enter valid numbers for capacity and price.');
        return;
      }

      const response = await fetch('/api/seminars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedSeminar),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Seminar created:', data);
        setNewSeminar({
          title: '',
          date: '',
          time: '',
          description: '',
          capacity: '',
          price: '',
        });
        fetchSeminars();
      } else {
        const errorData = await response.json();
        console.error('Failed to create seminar:', errorData);
        alert(errorData.error || 'Failed to create seminar');
      }
    } catch (error) {
      console.error('Error creating seminar:', error);
      alert('An error occurred while creating the seminar');
    }
  };

  const handleDeleteSeminar = async (seminarId: string) => {
    if (confirm('Are you sure you want to delete this seminar?')) {
      try {
        const response = await fetch(`/api/seminars/${seminarId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchSeminars(); // Refresh the seminars list
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to delete seminar');
        }
      } catch (error) {
        console.error('Error deleting seminar:', error);
        alert('An error occurred while deleting the seminar');
      }
    }
  };

  const generateQRCode = async (seminarId: string) => {
    const registrationUrl = `${window.location.origin}/register/${seminarId}`;
    try {
      const response = await fetch(`/api/seminars/${seminarId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: registrationUrl }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('QR code generated successfully:', result);
        fetchSeminars(); // Refresh the seminars list to show the updated QR code
      } else {
        const errorText = await response.text();
        console.error('Failed to save QR code. Server response:', errorText);
        alert(`Failed to save QR code. Status: ${response.status}. ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('An error occurred while saving the QR code');
    }
  };

  const deleteQRCode = async (seminarId: string) => {
    if (confirm('Are you sure you want to delete the QR code for this seminar?')) {
      try {
        const response = await fetch(`/api/seminars/${seminarId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCode: null }),
        });
        if (response.ok) {
          console.log('QR code deleted successfully');
          fetchSeminars(); // Refresh the seminars list
        } else {
          const errorText = await response.text();
          console.error('Failed to delete QR code. Server response:', errorText);
          alert(`Failed to delete QR code. Status: ${response.status}. ${errorText}`);
        }
      } catch (error) {
        console.error('Error deleting QR code:', error);
        alert('An error occurred while deleting the QR code');
      }
    }
  };

  const handleSendInvitations = async (seminarId: string, attendeeEmails: string[]) => {
    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seminarId, attendeeEmails }),
      });

      if (response.ok) {
        alert('Invitations sent successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send invitations');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('An error occurred while sending invitations');
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="title"
              type="text"
              name="title"
              value={newSeminar.title}
              onChange={handleInputChange}
              required
              placeholder="Enter seminar title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="date"
              type="date"
              name="date"
              value={newSeminar.date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
              Time
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="time"
              type="time"
              name="time"
              value={newSeminar.time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              name="description"
              value={newSeminar.description}
              onChange={handleInputChange}
              required
              placeholder="Enter seminar description"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
              Capacity
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="capacity"
              type="number"
              name="capacity"
              value={newSeminar.capacity}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Enter seminar capacity"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price ($)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="price"
              type="number"
              name="price"
              step="0.01"
              value={newSeminar.price}
              onChange={handleInputChange}
              required
              min="0"
              placeholder="Enter seminar price"
            />
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create Seminar
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-3">Your Seminars:</h2>
        {seminars.length > 0 ? (
          <ul className="mb-4">
            {seminars.map((seminar) => (
              <li key={seminar._id} className="mb-2 p-2 border rounded">
                <h3 className="font-semibold">{seminar.title}</h3>
                <p>Date: {new Date(seminar.date).toLocaleDateString()}</p>
                <p>Time: {seminar.time}</p>
                <p>Description: {seminar.description}</p>
                <p>Attendees: {seminar.attendees.length} / {seminar.capacity}</p>
                <p>Price: ${seminar.price.toFixed(2)}</p>
                <button
                  onClick={() => handleDeleteSeminar(seminar._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mt-2 mr-2"
                >
                  Delete
                </button>
                {seminar.qrCode ? (
                  <div className="mt-4 p-4 border rounded">
                    <h3 className="text-lg font-semibold mb-2">QR Code for Registration</h3>
                    <QRCode value={seminar.qrCode} size={150} />
                    <p className="mt-2 text-sm">Scan this QR code to register for the seminar</p>
                    <p className="text-xs text-gray-600 break-all">{seminar.qrCode}</p>
                    <button
                      onClick={() => deleteQRCode(seminar._id)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mt-2"
                    >
                      Delete QR Code
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => generateQRCode(seminar._id)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mt-2"
                  >
                    Generate QR Code
                  </button>
                )}
                <InvitationForm seminarId={seminar._id} onSendInvitations={handleSendInvitations} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No seminars found. Create your first seminar above!</p>
        )}
      </div>
    </div>
  );
}
