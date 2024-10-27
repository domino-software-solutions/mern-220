'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSignInAlt, FaSignOutAlt, FaCalendarCheck, FaEnvelope } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { useUser } from '../../contexts/UserContext';

interface Invitation {
  _id: string;
  title: string;
  date: string;
  time: string;
}

const Hero = () => {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user.isLoggedIn && user.role === 'attendee') {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/attendee/invitations', {
        credentials: 'include'
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      const text = await response.text();
      console.log('Response text:', text);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      try {
        const data = JSON.parse(text);
        setInvitations(data);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setInvitations([]);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        setUser({ isLoggedIn: false, role: null, name: '' });
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleInvitations = () => {
    setShowInvitations(!showInvitations);
  };

  const handleDashboardNavigation = () => {
    setIsLoading(true);
    router.push(`/${user.role}/dashboard`);
  };

  const handleInvitationNavigation = (invitationId: string) => {
    setIsLoading(true);
    router.push(`/attendee/invitations/${invitationId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="max-w-4xl text-center space-y-5 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-cyan-400 mb-3 py-2">
          Seminar Crowds RSVP
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-cyan-400 py-2">
          {user.isLoggedIn 
            ? `Welcome, ${user.name && user.name.trim() !== '' ? user.name : 'User'}!` 
            : 'Register for Your Exclusive Seminar'}
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto text-gray-200">
          {user.isLoggedIn
            ? 'Access your personalized seminar information and registration details.'
            : 'Streamline your seminar registrations with SeminarCrowds RSVP. Sign up now to manage your events effortlessly!'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-5">
          {user.isLoggedIn ? (
            <>
              <button
                onClick={handleDashboardNavigation}
                disabled={isLoading}
                className="group flex items-center bg-white text-indigo-700 py-3 px-5 text-base font-semibold rounded-full hover:bg-indigo-100 transition-all duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <CgSpinner className="animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaCalendarCheck className="mr-2" />
                    My Events
                    <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
                  </>
                )}
              </button>
              {user.role === 'attendee' && (
                <div className="relative">
                  <button onClick={toggleInvitations} className="group flex items-center bg-teal-500 text-white py-3 px-5 text-base font-semibold rounded-full hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto">
                    <FaEnvelope className="mr-2" />
                    View Invitations
                    <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
                  </button>
                  {showInvitations && (
                    <div className="absolute mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        {invitations.length > 0 ? (
                          invitations.map((invitation) => (
                            <button 
                              key={invitation._id} 
                              onClick={() => handleInvitationNavigation(invitation._id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              disabled={isLoading}
                            >
                              {invitation.title} - {invitation.date} {invitation.time}
                            </button>
                          ))
                        ) : (
                          <p className="block px-4 py-2 text-sm text-gray-700">No current invitations</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button onClick={handleLogout} className="group flex items-center bg-transparent text-white py-3 px-5 text-base font-semibold rounded-full border-2 border-white hover:bg-white hover:text-indigo-700 transition-all duration-300 w-full sm:w-auto">
                <FaSignOutAlt className="mr-2" />
                Logout
                <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="group flex items-center bg-white text-indigo-700 py-3 px-5 text-base font-semibold rounded-full hover:bg-indigo-100 transition-all duration-300 w-full sm:w-auto">
                <FaSignInAlt className="mr-2" />
                Login to Register
                <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
              </Link>
              <Link href="/signup" className="group flex items-center bg-transparent text-white py-3 px-5 text-base font-semibold rounded-full border-2 border-white hover:bg-white hover:text-indigo-700 transition-all duration-300 w-full sm:w-auto">
                New User? Sign Up
                <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
              </Link>
            </>
          )}
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-20 h-20 relative mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full border-t-4 border-indigo-600 rounded-full animate-spin"></div>
            </div>
            <CgSpinner className="text-indigo-600 text-4xl animate-spin mb-3" />
            <p className="text-gray-800 font-semibold text-lg">Loading your experience...</p>
            <p className="text-gray-600 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
