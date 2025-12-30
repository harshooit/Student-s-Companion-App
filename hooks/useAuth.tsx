
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as db from '../lib/database';
import { env } from '../env';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = db.onAuthChange((user) => {
      setUser(user);
      setIsAdmin(user?.username === env.ADMIN_USERNAME);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      await db.loginUser(username, password);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed');
      setLoading(false);
      throw error;
    }
    // Auth state change will be handled by the listener
  };

  const register = async (name: string, username: string, password: string) => {
    setLoading(true);
    try {
      await db.registerUser(name, username, password);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Registration failed');
      setLoading(false);
      throw error;
    }
    // Auth state change will be handled by the listener
  };

  const logout = async () => {
    await db.logoutUser();
    setUser(null);
    setIsAdmin(false);
    window.location.hash = '';
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
