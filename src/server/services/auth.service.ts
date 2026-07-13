import { supabasePublic, createRequestClient } from '../config/supabase';
import { ProfileRepository } from '../repositories/profile.repo';
import { env } from '../config/env';
import { UserProfile } from '@/context/AuthContext';

// Hardcoded server-side fallback credentials for offline demo mode
const MOCK_USERS = [
  { id: 'usr_admin', email: 'admin@aonemobile.com', password: 'admin123', full_name: 'Store Manager', phone_number: '9999988888', role: 'Admin' },
  { id: 'usr_customer', email: 'vikas@aonemobile.com', password: 'vikas123', full_name: 'Vikas Sharma', phone_number: '9876543210', role: 'Customer' }
];

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.user && data.session) {
          // Fetch profile details
          const profile = await ProfileRepository.getProfile(data.user.id, data.session.access_token);
          const role = profile?.role || 'Customer';
          
          return {
            user: {
              id: data.user.id,
              email: data.user.email || '',
              full_name: profile?.full_name || data.user.user_metadata?.full_name || '',
              phone: profile?.phone || '',
              role
            },
            token: data.session.access_token
          };
        }
      } catch (e: any) {
        console.error('Database auth error, attempting mock fallback:', e);
        throw new Error(e?.message || 'Invalid login credentials');
      }
    }

    // Mock Login Fallback
    const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    return {
      user: {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        phone: mockUser.phone_number,
        role: mockUser.role as any
      },
      token: `mock-session-jwt-token-for-${mockUser.id}`
    };
  }

  static async register(email: string, password: string, fullName: string, phone: string): Promise<{ user: UserProfile; token: string }> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        // Sign up with Supabase
        const { data, error } = await supabasePublic.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;
        if (!data.user) throw new Error('Failed to create user account');

        // Note: The Supabase trigger on_auth_user_created handles profile sync in public.profiles.
        // We will insert/update the phone number and detail directly if RLS allows.
        const token = data.session?.access_token || '';
        
        return {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            full_name: fullName,
            phone: phone,
            role: 'Customer'
          },
          token
        };
      } catch (e: any) {
        console.error('Database signup error:', e);
        throw new Error(e?.message || 'Failed to register account');
      }
    }

    // Mock registration
    const existing = MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User already exists with this email address');
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      email,
      password,
      full_name: fullName,
      phone_number: phone,
      role: 'Customer'
    };
    MOCK_USERS.push(newUser);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone_number,
        role: 'Customer'
      },
      token: `mock-session-jwt-token-for-${newUser.id}`
    };
  }

  static async verifySession(token: string): Promise<UserProfile> {
    if (!token) throw new Error('Authorization token is required');

    if (token.startsWith('mock-session-jwt-token-for-')) {
      const userId = token.substring(27);
      const mockUser = MOCK_USERS.find(u => u.id === userId);
      if (!mockUser) throw new Error('Invalid session token');
      
      return {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        phone: mockUser.phone_number,
        role: mockUser.role as any
      };
    }

    if (env.supabaseUrl && env.supabaseAnonKey) {
      const client = createRequestClient(token);
      const { data: { user }, error } = await client.auth.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'Invalid user session');
      }

      const profile = await ProfileRepository.getProfile(user.id, token);
      
      return {
        id: user.id,
        email: user.email || '',
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        phone: profile?.phone || '',
        role: profile?.role || 'Customer'
      };
    }

    throw new Error('Database is unconfigured and token is invalid');
  }

  static async updateProfile(
    userId: string, 
    profileData: Partial<Omit<UserProfile, 'id' | 'role'>>, 
    token: string
  ): Promise<UserProfile> {
    if (token.startsWith('mock-session-jwt-token-for-')) {
      const mockUser = MOCK_USERS.find(u => u.id === userId);
      if (!mockUser) throw new Error('Mock user profile not found');
      
      if (profileData.full_name) mockUser.full_name = profileData.full_name;
      if (profileData.phone) mockUser.phone_number = profileData.phone;
      
      return {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        phone: mockUser.phone_number,
        role: mockUser.role as any
      };
    }

    const profile = await ProfileRepository.updateProfile(userId, profileData, token);
    if (!profile) {
      throw new Error('Failed to update profile');
    }
    
    return profile;
  }
}
