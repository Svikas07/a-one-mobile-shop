import { createRequestClient, supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { UserProfile } from '@/context/AuthContext';

export class ProfileRepository {
  static async getProfile(userId: string, token?: string): Promise<UserProfile | null> {
    if (env.supabaseUrl && env.supabaseAnonKey && token) {
      try {
        const client = createRequestClient(token);
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone_number,
          role: data.role,
          status: data.status
        };
      } catch (e) {
        console.error('Database error in getProfile, falling back to mock:', e);
      }
    }
    return null;
  }

  static async updateProfile(
    userId: string, 
    profileData: Partial<Omit<UserProfile, 'id' | 'role'>>, 
    token?: string
  ): Promise<UserProfile | null> {
    if (env.supabaseUrl && env.supabaseAnonKey && token) {
      try {
        const client = createRequestClient(token);
        const { data, error } = await client
          .from('profiles')
          .update({
            full_name: profileData.full_name,
            phone_number: profileData.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (error) throw error;
        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone_number,
          role: data.role,
          status: data.status
        };
      } catch (e) {
        console.error('Database error in updateProfile, falling back to mock:', e);
      }
    }
    return null;
  }

  // System admin query to check roles
  static async getRole(userId: string): Promise<string> {
    if (env.supabaseUrl && env.supabaseServiceRoleKey && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (!error && data) return data.role;
      } catch (e) {
        console.error('Admin DB error in getRole:', e);
      }
    }
    return 'Customer';
  }
}
