'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSignInAlt, FaSignOutAlt, FaCalendarCheck } from 'react-icons/fa';

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserRole(data.user.role);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        setIsLoggedIn(false);
        setUserRole(null);
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
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
          {isLoggedIn ? `Welcome, ${userRole}!` : 'Register for Your Exclusive Seminar'}
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto text-gray-200">
          {isLoggedIn
            ? 'Access your personalized seminar information and registration details.'
            : 'Streamline your seminar registrations with SeminarCrowds RSVP. Sign up now to manage your events effortlessly!'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-5">
          {isLoggedIn ? (
            <>
              <Link href={`/${userRole}/dashboard`} className="group flex items-center bg-white text-indigo-700 py-3 px-5 text-base font-semibold rounded-full hover:bg-indigo-100 transition-all duration-300 w-full sm:w-auto">
                <FaCalendarCheck className="mr-2" />
                View Seminar Details
                <span className="ml-2 group-hover:ml-4 transition-all duration-300">&rarr;</span>
              </Link>
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
    </div>
  );
};

export default Hero;
