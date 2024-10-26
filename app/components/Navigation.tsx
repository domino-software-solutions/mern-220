'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface NavigationProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

export default function Navigation({ isLoggedIn, userRole }: NavigationProps) {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-cyan-400">
            Seminar Crowds RSVP
        </Link>
        <div className="space-x-4">
          {isLoggedIn ? (
            <>
              {userRole === 'admin' && (
                <Link href="/admin/dashboard" className="hover:text-teal-200 transition-colors duration-300">Admin Dashboard</Link>
              )}
              {userRole === 'agent' && (
                <Link href="/agent/dashboard" className="hover:text-teal-200 transition-colors duration-300">Agent Dashboard</Link>
              )}
              {userRole === 'attendee' && (
                <Link href="/attendee/dashboard" className="hover:text-teal-200 transition-colors duration-300">My Events</Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-teal-200 transition-colors duration-300">Login</Link>
              <Link href="/signup" className="bg-white text-indigo-700 py-2 px-4 rounded-full hover:bg-indigo-100 transition-all duration-300 transform hover:scale-105">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
