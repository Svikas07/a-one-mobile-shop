import { supabasePublic } from '../config/supabase';
import { MOCK_CATEGORIES } from '../config/mockData';
import { Category } from '@/lib/db';
import { env } from '../config/env';

export class CategoryRepository {
  static async getCategories(): Promise<Category[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const { data, error } = await supabasePublic
          .from('categories')
          .select('*')
          .eq('status', 'Active')
          .order('sort_order');
          
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getCategories, falling back to mock data:', e);
      }
    }
    return MOCK_CATEGORIES.filter(c => c.status === 'Active').sort((a, b) => a.sort_order - b.sort_order);
  }
}
