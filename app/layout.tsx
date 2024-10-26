'use client';

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

import { useState, useEffect } from 'react';

// Font configuration
const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

// Metadata (now as a constant, not exported)
const metadata: Metadata = {
  title: "Seminar Crowds RSVP",
  description: "Reliable software solutions for your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState({ isLoggedIn: false, role: null });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUser({ isLoggedIn: true, role: data.user.role });
        } else {
          setUser({ isLoggedIn: false, role: null });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser({ isLoggedIn: false, role: null });
      }
    };

    checkAuth();
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo.ico" />
        <meta name="description" content={metadata.description ?? undefined} />
        <title>{metadata.title ? String(metadata.title) : ''}</title>
      </head>
      <body className={poppins.className}>
        <Navigation isLoggedIn={user.isLoggedIn} userRole={user.role} />
  
        {children}
      </body>
    </html>
  );
}
