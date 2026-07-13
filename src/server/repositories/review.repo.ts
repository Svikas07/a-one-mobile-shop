import { supabasePublic, createRequestClient } from '../config/supabase';
import { serverMockState } from '../config/mockData';
import { Review } from '@/lib/db';
import { env } from '../config/env';

export class ReviewRepository {
  static async getReviews(productId: string): Promise<Review[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const { data, error } = await supabasePublic
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'Approved');
          
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getReviews, falling back to mock data:', e);
      }
    }
    return serverMockState.reviews.filter(r => r.product_id === productId);
  }

  static async addReview(
    productId: string, 
    review: Omit<Review, 'id' | 'created_at' | 'helpful_count' | 'product_id'>, 
    token?: string
  ): Promise<Review> {
    const newReview: Review = {
      ...review,
      product_id: productId,
      id: 'rev_' + Math.random().toString(36).substring(2, 11),
      helpful_count: 0,
      created_at: new Date().toISOString()
    };

    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const client = createRequestClient(token);
        const { data, error } = await client
          .from('reviews')
          .insert([{ 
            product_id: productId,
            full_name: review.full_name,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            verified_purchase: review.verified_purchase
          }])
          .select()
          .single();
          
        if (error) throw error;
        if (data) return data;
      } catch (e) {
        console.error('Database error in addReview, falling back to mock data:', e);
      }
    }

    serverMockState.reviews.unshift(newReview);
    return newReview;
  }
}
