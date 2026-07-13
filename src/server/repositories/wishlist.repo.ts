import { createRequestClient } from '../config/supabase';
import { serverMockState } from '../config/mockData';
import { env } from '../config/env';

export class WishlistRepository {
  static async getWishlist(userId: string, token?: string): Promise<string[]> {
    if (env.supabaseUrl && env.supabaseAnonKey && token) {
      try {
        const client = createRequestClient(token);
        const { data, error } = await client
          .from('wishlist')
          .select('product_id')
          .eq('user_id', userId);
          
        if (error) throw error;
        return data?.map((w: any) => w.product_id) || [];
      } catch (e) {
        console.error('Database error in getWishlist, falling back to mock state:', e);
      }
    }
    return serverMockState.wishlists[userId] || [];
  }

  static async toggleWishlist(productId: string, userId: string, token?: string): Promise<string[]> {
    if (env.supabaseUrl && env.supabaseAnonKey && token) {
      try {
        const client = createRequestClient(token);
        
        // Check if exists
        const { data: existing } = await client
          .from('wishlist')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle();
          
        if (existing) {
          // Delete it
          await client
            .from('wishlist')
            .delete()
            .eq('id', existing.id);
        } else {
          // Add it
          await client
            .from('wishlist')
            .insert([{ user_id: userId, product_id: productId }]);
        }
        
        return this.getWishlist(userId, token);
      } catch (e) {
        console.error('Database error in toggleWishlist, falling back to mock state:', e);
      }
    }

    const current = serverMockState.wishlists[userId] || [];
    const index = current.indexOf(productId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(productId);
    }
    serverMockState.wishlists[userId] = current;
    return current;
  }
}
