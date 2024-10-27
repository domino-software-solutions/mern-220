'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  isLoggedIn: boolean;
  role: string | null;
  name: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

const defaultUser: User = {
  isLoggedIn: false,
  role: null,
  name: ''
};

export const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {}
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
