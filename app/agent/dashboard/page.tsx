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
  const [expandedQR, setExpandedQR] = useState<string | null>(null);
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

  const toggleQRCode = (seminarId: string) => {
    setExpandedQR(expandedQR === seminarId ? null : seminarId);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="container mx-auto mt-10 p-5">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Agent Dashboard</h1>
      <div className="mb-8">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 mb-4 w-full md:w-auto"
        >
          {showCreateForm ? 'Hide Create Form' : 'Create New Seminar'}
        </button>
        {showCreateForm && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <CreateSeminarForm onSeminarCreated={handleSeminarCreated} />
          </div>
        )}
      </div>
      <h2 className="text-3xl font-semibold mb-6 text-gray-700">Your Seminars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seminars.map((seminar) => (
          <div key={seminar._id} className="bg-white shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:scale-105 flex flex-col h-[600px]">
            <div className="p-6 flex-grow overflow-y-auto">
              <h3 className="text-2xl font-bold mb-2 text-gray-800 truncate">{seminar.title}</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{seminar.date}</span>
                <span>{seminar.time}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Capacity: {seminar.capacity}</span>
                <span>Price: ${seminar.price}</span>
              </div>
              <p className="text-gray-700 mb-4 text-sm line-clamp-3">{seminar.description}</p>
              
              <h4 className="font-semibold mb-2 text-gray-800">Attendees</h4>
              <ul className="mb-4 space-y-1 max-h-24 overflow-y-auto">
                {seminar.attendees.map((attendee) => (
                  <li key={attendee._id} className="text-sm text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {attendee.name}
                  </li>
                ))}
              </ul>

              {seminar.qrCodeDataUrl ? (
                <div className="mt-4 flex justify-center">
                  <button onClick={() => toggleQRCode(seminar._id)} className="text-blue-600 hover:text-blue-800 transition duration-300">
                    {expandedQR === seminar._id ? 'Hide QR Code' : 'Show QR Code'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateQR(seminar._id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out text-sm"
                >
                  Generate QR Code
                </button>
              )}

              {expandedQR === seminar._id && seminar.qrCodeDataUrl && (
                <div className="mt-4 flex justify-center">
                  <Image src={seminar.qrCodeDataUrl} alt="QR Code" width={200} height={200} />
                </div>
              )}
            </div>
            <div className="p-6 mt-auto">
              <InvitationForm
                seminarId={seminar._id}
                onSendInvitations={handleSendInvitations}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
