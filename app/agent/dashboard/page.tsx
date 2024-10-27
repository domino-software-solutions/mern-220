'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InvitationForm from '@/app/components/InvitationForm';
import CreateSeminarForm from '@/app/components/CreateSeminarForm';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

interface Attendee {
  _id: string;
  name: string;
  email: string;
  confirmed: boolean;
}

interface Seminar {
  _id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  attendees: Attendee[];
  qrCode?: string;
  qrCodeData?: string;
  price: number;
  qrCodeDataUrl?: string;
}

export default function AgentDashboard() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
          setLoading(false);
          fetchSeminars();
        }
      }
    };

    checkAuth();
  }, [router]);

  const fetchSeminars = async () => {
    try {
      const response = await fetch('/api/agent/seminars-with-attendees');
      if (response.ok) {
        const data = await response.json();
        setSeminars(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch seminars:', errorData);
        alert(`Failed to fetch seminars. Status: ${response.status}, Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
      alert(`Error fetching seminars: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
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

  const handleGenerateQR = async (seminarId: string) => {
    try {
      const response = await fetch(`/api/attendee/seminars/${seminarId}/qr`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('QR code generated:', data);
        // Update the seminars state with the new QR code
        setSeminars(prevSeminars => prevSeminars.map(seminar => 
          seminar._id === seminarId ? { ...seminar, qrCodeDataUrl: data.qrCodeDataUrl } : seminar
        ));
      } else {
        const errorData = await response.json();
        console.error('Failed to generate QR code:', errorData);
        alert(`Failed to generate QR code. Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('An error occurred while generating the QR code');
    }
  };

  const handleSeminarCreated = () => {
    setShowCreateForm(false);
    fetchSeminars();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-3xl font-bold mb-5">Agent Dashboard</h1>
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {showCreateForm ? 'Hide Create Form' : 'Create New Seminar'}
      </button>
      {showCreateForm && <CreateSeminarForm onSeminarCreated={handleSeminarCreated} />}
      <h2 className="text-2xl font-semibold mb-3">Your Seminars:</h2>
      <ul className="list-none mb-8">
        {seminars.map((seminar) => (
          <li key={seminar._id} className="border p-4 rounded mb-4">
            <h3 className="text-xl font-semibold">{seminar.title}</h3>
            <p>Date: {seminar.date} | Time: {seminar.time}</p>
            <p>Capacity: {seminar.capacity} | Price: ${seminar.price}</p>
            <p className="mt-2">{seminar.description}</p>
            
            <h4 className="font-semibold mt-4">Attendees:</h4>
            <ul className="list-disc pl-5">
              {seminar.attendees.map((attendee) => (
                <li key={attendee._id} className="text-green-600">
                  {attendee.name} ({attendee.email})
                </li>
              ))}
            </ul>

            {seminar.qrCodeDataUrl ? (
              <div className="mt-4">
                <h4 className="font-semibold">QR Code:</h4>
                <Image src={seminar.qrCodeDataUrl} alt="QR Code" width={200} height={200} />
              </div>
            ) : (
              <button
                onClick={() => handleGenerateQR(seminar._id)}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              >
                Generate QR Code
              </button>
            )}
            
            <InvitationForm
              seminarId={seminar._id}
              onSendInvitations={handleSendInvitations}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
