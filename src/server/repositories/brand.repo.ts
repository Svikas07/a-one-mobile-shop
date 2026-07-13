import { supabasePublic } from '../config/supabase';
import { MOCK_BRANDS } from '../config/mockData';
import { Brand } from '@/lib/db';
import { env } from '../config/env';

export class BrandRepository {
  static async getBrands(): Promise<Brand[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const { data, error } = await supabasePublic
          .from('brands')
          .select('*')
          .eq('status', 'Active')
          .order('sort_order');
          
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getBrands, falling back to mock data:', e);
      }
    }
    return MOCK_BRANDS.filter(b => b.status === 'Active').sort((a, b) => a.sort_order - b.sort_order);
  }
}
