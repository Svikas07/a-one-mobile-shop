import { supabasePublic, supabaseAdmin } from '../config/supabase';
import { serverMockState } from '../config/mockData';
import { Coupon } from '@/lib/db';
import { env } from '../config/env';

export class CouponRepository {
  static async getCoupons(): Promise<Coupon[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        // Use supabaseAdmin on the server since regular users lack direct read policies on coupons
        const client = supabaseAdmin || supabasePublic;
        const { data, error } = await client
          .from('coupons')
          .select('*')
          .eq('status', 'Active');
          
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getCoupons, falling back to mock data:', e);
      }
    }
    return serverMockState.coupons.filter(c => c.status === 'Active');
  }

  static async getAdminCoupons(): Promise<Coupon[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const client = supabaseAdmin || supabasePublic;
        const { data, error } = await client
          .from('coupons')
          .select('*');
          
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getAdminCoupons, falling back to mock data:', e);
      }
    }
    return serverMockState.coupons;
  }

  static async saveCoupon(coupon: Coupon): Promise<Coupon> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const client = supabaseAdmin || supabasePublic;
        const { data, error } = await client
          .from('coupons')
          .upsert([coupon])
          .select()
          .single();
          
        if (error) throw error;
        if (data) return data;
      } catch (e) {
        console.error('Database error in saveCoupon, falling back to mock memory storage:', e);
      }
    }

    const idx = serverMockState.coupons.findIndex(c => c.id === coupon.id);
    if (idx > -1) {
      serverMockState.coupons[idx] = coupon;
    } else {
      serverMockState.coupons.push(coupon);
    }
    return coupon;
  }
}
