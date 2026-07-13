import { supabasePublic } from '../config/supabase';
import { MOCK_MODELS } from '../config/mockData';
import { PhoneModel } from '@/lib/db';
import { env } from '../config/env';

export class ModelRepository {
  static async getPhoneModels(brandId?: string): Promise<PhoneModel[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        let query = supabasePublic
          .from('phone_models')
          .select('*')
          .eq('status', 'Active');
          
        if (brandId) {
          query = query.eq('brand_id', brandId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getPhoneModels, falling back to mock data:', e);
      }
    }
    
    let result = MOCK_MODELS.filter(m => m.status === 'Active');
    if (brandId) {
      result = result.filter(m => m.brand_id === brandId);
    }
    return result;
  }

  static async getPhoneModelBySlug(slug: string): Promise<PhoneModel | null> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const { data, error } = await supabasePublic
          .from('phone_models')
          .select('*')
          .eq('model_slug', slug)
          .single();
          
        if (error) throw error;
        return data;
      } catch (e) {
        console.error('Database error in getPhoneModelBySlug, falling back to mock data:', e);
      }
    }
    
    return MOCK_MODELS.find(m => m.model_slug === slug) || null;
  }
}
