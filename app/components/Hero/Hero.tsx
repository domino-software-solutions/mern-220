'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSignInAlt, FaSignOutAlt, FaCalendarCheck, FaEnvelope } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const Hero = () => {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [showInvitations, setShowInvitations] = useState(false);

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
          {user.isLoggedIn ? `Welcome, ${user.role}!` : 'Register for Your Exclusive Seminar'}
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto text-gray-200">
          {user.isLoggedIn
            ? 'Access your personalized seminar information and registration details.'
            : 'Streamline your seminar registrations with SeminarCrowds RSVP. Sign up now to manage your events effortlessly!'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-5">
          {user.isLoggedIn ? (
            <>
              <Link href={`/${user.role}/dashboard`} className="group flex items-center bg-white text-indigo-700 py-3 px-5 text-base font-semibold rounded-full hover:bg-indigo-100 transition-all duration-300 w-full sm:w-auto">
                <FaCalendarCheck className="mr-2" />
                View Seminar Details
                <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
              </Link>
              {user.role === 'attendee' && (
                <button onClick={toggleInvitations} className="group flex items-center bg-teal-500 text-white py-3 px-5 text-base font-semibold rounded-full hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto">
                  <FaEnvelope className="mr-2" />
                  {showInvitations ? 'Hide Invitations' : 'View Invitations'}
                  <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
                </button>
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
        {showInvitations && user.role === 'attendee' && (
          <div className="mt-8 bg-white bg-opacity-10 p-6 rounded-xl backdrop-filter backdrop-blur-lg">
            <h3 className="text-2xl font-bold mb-4">Your Invitations</h3>
            <Link href="/attendee/invitations" className="bg-indigo-500 text-white py-2 px-4 rounded-full hover:bg-indigo-600 transition-all duration-300">
              View and Respond to Invitations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
