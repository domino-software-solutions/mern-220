'use client';

import { useState } from 'react';

interface RSVPFormProps {
  userId: string;
}

export default function RSVPForm({ userId }: RSVPFormProps) {
  const [eventName, setEventName] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventName, attendees }),
      });

      if (response.ok) {
        setMessage('RSVP submitted successfully!');
        setEventName('');
        setAttendees(1);
      } else {
        setMessage('Failed to submit RSVP. Please try again.');
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">RSVP for Event</h2>
      <div className="mb-4">
        <label htmlFor="eventName" className="block mb-2">Event Name</label>
        <input
          type="text"
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="attendees" className="block mb-2">Number of Attendees</label>
        <input
          type="number"
          id="attendees"
          value={attendees}
          onChange={(e) => setAttendees(parseInt(e.target.value))}
          min="1"
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Submit RSVP
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </form>
  );
}
