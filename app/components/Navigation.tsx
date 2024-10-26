'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default function Navigation() {
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
  }, [router]);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          InsureRSVP
        </Link>
        <div className="space-x-4">
          {isLoggedIn ? (
            <>
              {userRole === 'admin' && (
                <Link href="/admin/dashboard" className="hover:text-gray-300">Admin Dashboard</Link>
              )}
              {userRole === 'agent' && (
                <Link href="/agent/dashboard" className="hover:text-gray-300">Agent Dashboard</Link>
              )}
              {userRole === 'attendee' && (
                <Link href="/attendee/dashboard" className="hover:text-gray-300">My Events</Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">Login</Link>
              <Link href="/signup" className="hover:text-gray-300">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
