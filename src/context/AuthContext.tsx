'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  role: 'Customer' | 'Admin' | 'Manager' | 'Inventory Staff' | 'Support Staff';
  status?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'aone_session_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to make API requests with token
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    return { res, data };
  };

  useEffect(() => {
    const initSession = async () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { res, data } = await apiFetch('/api/auth/session');
        if (res.ok && data.data) {
          setUser(data.data.user);
        } else {
          // Token invalid or expired
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const { res, data } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok && data.data) {
        const { user, token } = data.data;
        setUser(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
        }
        setLoading(false);
        return { success: true, message: 'Logged in successfully!' };
      }
      
      setLoading(false);
      return { success: false, message: data.error || 'Invalid credentials.' };
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || 'Login failed due to a network error.' };
    }
  };

  const register = async (email: string, password: string, fullName: string, phone: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const { res, data } = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, phone }),
      });

      if (res.ok && data.data) {
        const { user, token } = data.data;
        setUser(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
        }
        setLoading(false);
        return { success: true, message: 'Account created successfully!' };
      }
      
      setLoading(false);
      return { success: false, message: data.error || 'Registration failed.' };
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || 'Registration failed due to a network error.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    setUser(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };
    
    setLoading(true);
    try {
      const { res, data } = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (res.ok && data.data) {
        setUser(data.data);
        setLoading(false);
        return { success: true, message: 'Profile updated successfully!' };
      }

      setLoading(false);
      return { success: false, message: data.error || 'Failed to update profile.' };
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || 'Update failed due to a network error.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
