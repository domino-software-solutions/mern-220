'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        setIsLoggedIn(response.ok);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
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
              <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
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
