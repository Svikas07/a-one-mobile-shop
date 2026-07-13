import { supabasePublic } from '../config/supabase';
import { serverMockState, MOCK_MODELS } from '../config/mockData';
import { Product } from '@/lib/db';
import { env } from '../config/env';

export class ProductRepository {
  static async getProducts(filters?: {
    brandId?: string;
    modelId?: string;
    categoryId?: string;
    material?: string;
    finish?: string;
    color?: string;
    speed?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    sort?: string;
  }): Promise<Product[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        let query = supabasePublic
          .from('products')
          .select('*, compatibility(phone_model_id)')
          .eq('status', 'Published');
          
        if (filters?.brandId) query = query.eq('brand_id', filters.brandId);
        if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
        if (filters?.material) query = query.eq('material', filters.material);
        if (filters?.finish) query = query.eq('finish', filters.finish);
        if (filters?.color) query = query.eq('color', filters.color);
        if (filters?.speed) query = query.eq('charging_speed', filters.speed);
        
        const { data, error } = await query;
        if (!error && data) {
          let results = data.map((item: any) => ({
            ...item,
            compatibility: item.compatibility?.map((c: any) => c.phone_model_id) || []
          }));
          
          if (filters?.modelId) {
            results = results.filter(p => p.compatibility.includes(filters.modelId!));
          }
          
          if (filters?.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            results = results.filter(p => 
              p.product_name.toLowerCase().includes(q) || 
              p.sku.toLowerCase().includes(q) ||
              p.short_description.toLowerCase().includes(q)
            );
          }
          
          if (filters?.minPrice !== undefined) results = results.filter(p => (p.sale_price || p.price) >= filters.minPrice!);
          if (filters?.maxPrice !== undefined) results = results.filter(p => (p.sale_price || p.price) <= filters.maxPrice!);
          
          if (filters?.sort === 'price-low-high') {
            results.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
          } else if (filters?.sort === 'price-high-low') {
            results.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
          } else if (filters?.sort === 'newest') {
            results.sort((a, b) => b.new_arrival === a.new_arrival ? 0 : b.new_arrival ? 1 : -1);
          } else {
            results.sort((a, b) => b.best_seller === a.best_seller ? 0 : b.best_seller ? 1 : -1);
          }
          
          return results;
        }
      } catch (e) {
        console.error('Database error in getProducts, falling back to mock data:', e);
      }
    }
    
    // Server-side fallback mock filter
    let products = [...serverMockState.products].filter(p => p.status === 'Published');
    
    if (filters) {
      if (filters.brandId) {
        const brandModels = MOCK_MODELS.filter(m => m.brand_id === filters.brandId).map(m => m.id);
        products = products.filter(p => p.compatibility.some(mid => brandModels.includes(mid)));
      }
      if (filters.modelId) {
        products = products.filter(p => p.compatibility.includes(filters.modelId!));
      }
      if (filters.categoryId) {
        products = products.filter(p => p.category_id === filters.categoryId);
      }
      if (filters.material) {
        products = products.filter(p => p.material?.toLowerCase() === filters.material?.toLowerCase());
      }
      if (filters.finish) {
        products = products.filter(p => p.finish?.toLowerCase() === filters.finish?.toLowerCase());
      }
      if (filters.color) {
        products = products.filter(p => p.color?.toLowerCase().includes(filters.color!.toLowerCase()));
      }
      if (filters.speed) {
        products = products.filter(p => p.charging_speed?.toLowerCase() === filters.speed?.toLowerCase());
      }
      if (filters.minPrice !== undefined) {
        products = products.filter(p => (p.sale_price || p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(p => (p.sale_price || p.price) <= filters.maxPrice!);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        products = products.filter(p => 
          p.product_name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.full_description.toLowerCase().includes(q)
        );
      }
      if (filters.sort) {
        if (filters.sort === 'price-low-high') {
          products.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        } else if (filters.sort === 'price-high-low') {
          products.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        } else if (filters.sort === 'newest') {
          products.sort((a, b) => (b.new_arrival ? 1 : 0) - (a.new_arrival ? 1 : 0));
        } else if (filters.sort === 'popular') {
          products.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        }
      }
    }
    
    return products;
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const { data, error } = await supabasePublic
          .from('products')
          .select('*, compatibility(phone_model_id)')
          .eq('slug', slug)
          .single();
          
        if (!error && data) {
          return {
            ...data,
            compatibility: data.compatibility?.map((c: any) => c.phone_model_id) || []
          };
        }
      } catch (e) {
        console.error('Database error in getProductBySlug, falling back to mock data:', e);
      }
    }
    
    return serverMockState.products.find(p => p.slug === slug) || null;
  }
}
