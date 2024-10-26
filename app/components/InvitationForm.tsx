import React, { useState } from 'react';

interface InvitationFormProps {
  seminarId: string;
  onSendInvitations: (seminarId: string, attendeeEmails: string[]) => void;
}

const InvitationForm: React.FC<InvitationFormProps> = ({ seminarId, onSendInvitations }) => {
  const [emails, setEmails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailList = emails.split(',').map(email => email.trim());
    onSendInvitations(seminarId, emailList);
    setEmails('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        placeholder="Enter attendee emails (comma-separated)"
        className="w-full p-2 border rounded"
        rows={3}
      />
      <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Send Invitations
      </button>
    </form>
  );
};

export default InvitationForm;
