'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/db';

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

const OFFLINE_USERS_KEY = 'aone_mock_users';
const OFFLINE_SESSION_KEY = 'aone_mock_session';

const DEFAULT_USERS = [
  {
    id: 'user_admin',
    email: 'admin@aonemobile.com',
    password: 'admin123',
    full_name: 'Admin Manager',
    phone: '9999999999',
    role: 'Admin'
  },
  {
    id: 'user_customer',
    email: 'vikas@aonemobile.com',
    password: 'vikas123',
    full_name: 'Vikas Sharma',
    phone: '9876543210',
    role: 'Customer'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        // Supabase Auth Listener
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              phone: profile.phone,
              full_name: profile.full_name,
              role: profile.role,
              status: profile.status
            });
          }
        }
        
        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                phone: profile.phone,
                full_name: profile.full_name,
                role: profile.role,
                status: profile.status
              });
            }
          } else {
            setUser(null);
          }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // LocalStorage Auth Mock
        if (typeof window !== 'undefined') {
          // Preseed users list if not exists
          if (!localStorage.getItem(OFFLINE_USERS_KEY)) {
            localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
          }
          
          const savedSession = localStorage.getItem(OFFLINE_SESSION_KEY);
          if (savedSession) {
            try {
              setUser(JSON.parse(savedSession));
            } catch (e) {
              localStorage.removeItem(OFFLINE_SESSION_KEY);
            }
          }
        }
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // Login Function
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single();
          
        if (profileErr || !profile) {
          throw new Error('Profile does not exist for this authenticated user.');
        }

        const loggedInUser: UserProfile = {
          id: profile.id,
          email: profile.email,
          phone: profile.phone,
          full_name: profile.full_name,
          role: profile.role,
          status: profile.status
        };
        setUser(loggedInUser);
        setLoading(false);
        return { success: true, message: 'Welcome back!' };
      } else {
        // Mock Login
        const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || JSON.stringify(DEFAULT_USERS));
        const matched = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (matched) {
          const loggedInUser: UserProfile = {
            id: matched.id,
            email: matched.email,
            phone: matched.phone,
            full_name: matched.full_name,
            role: matched.role
          };
          setUser(loggedInUser);
          localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(loggedInUser));
          setLoading(false);
          return { success: true, message: 'Welcome back (Offline Mode)!' };
        } else {
          setLoading(false);
          return { success: false, message: 'Invalid email address or password combination.' };
        }
      }
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || 'Login failed.' };
    }
  };

  // Register Function
  const register = async (email: string, password: string, fullName: string, phone: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });
        if (error) throw error;
        
        // Supabase triggers profile creation on signUp. We insert manually if trigger delay or fallback
        if (data.user) {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              phone: phone,
              role: 'Customer'
            }
          ]);
        }
        
        setLoading(false);
        return { success: true, message: 'Registration successful! Verification link sent to email.' };
      } else {
        // Mock Register
        const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || JSON.stringify(DEFAULT_USERS));
        if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          setLoading(false);
          return { success: false, message: 'An account with this email already exists.' };
        }

        const newUser = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email,
          password,
          full_name: fullName,
          phone,
          role: 'Customer' as const
        };

        users.push(newUser);
        localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));

        // Auto login after mock register
        const loggedInUser: UserProfile = {
          id: newUser.id,
          email: newUser.email,
          phone: newUser.phone,
          full_name: newUser.full_name,
          role: newUser.role
        };
        setUser(loggedInUser);
        localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(loggedInUser));

        setLoading(false);
        return { success: true, message: 'Account created successfully (Offline Mode)!' };
      }
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || 'Registration failed.' };
    }
  };

  // Logout Function
  const logout = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(OFFLINE_SESSION_KEY);
    }
    setUser(null);
    setLoading(false);
  };

  // Update Profile Details
  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
        if (error) throw error;
        
        setUser(prev => prev ? { ...prev, ...updates } : null);
        setLoading(false);
        return { success: true, message: 'Profile updated successfully!' };
      } else {
        // Mock Update Profile
        const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || JSON.stringify(DEFAULT_USERS));
        const updatedUsers = users.map((u: any) => {
          if (u.id === user.id) {
            return { ...u, ...updates };
          }
          return u;
        });

        localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(updatedUsers));
        
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(updatedUser));
        
        setLoading(false);
        return { success: true, message: 'Profile updated (Offline Mode)!' };
      }
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || 'Failed to update profile.' };
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
