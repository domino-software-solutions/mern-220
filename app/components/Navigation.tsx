'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';

export default function Navigation() {
  const router = useRouter();
  const { user, setUser } = useUser();

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

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-cyan-400">
          Seminar Crowds RSVP
        </Link>
        <div className="space-x-4 flex items-center">
          {user.isLoggedIn ? (
            <>
              <span className="flex items-center">
                <FaUserCircle className="mr-2" />
                {user.name}
              </span>
              {user.role === 'admin' && (
                <Link href="/admin/dashboard" className="hover:text-teal-200 transition-colors duration-300">Admin Dashboard</Link>
              )}
              {user.role === 'agent' && (
                <Link href="/agent/dashboard" className="hover:text-teal-200 transition-colors duration-300">Agent Dashboard</Link>
              )}
              {user.role === 'attendee' && (
                <Link href="/attendee/dashboard" className="hover:text-teal-200 transition-colors duration-300">My Events</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-700 py-2 px-4 rounded-full hover:bg-indigo-100 transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
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
