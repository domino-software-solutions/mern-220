'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  isLoggedIn: boolean;
  role: string | null;
  name: string;
}

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ isLoggedIn: false, role: null, name: '' });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUser({ isLoggedIn: true, role: data.user.role, name: data.user.name });
        } else {
          setUser({ isLoggedIn: false, role: null, name: '' });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser({ isLoggedIn: false, role: null, name: '' });
      }
    };

    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
