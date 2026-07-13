import { ReviewRepository } from '../repositories/review.repo';
import { Review } from '@/lib/db';

export class ReviewService {
  static async getProductReviews(productId: string): Promise<Review[]> {
    return ReviewRepository.getReviews(productId);
  }

  static async submitReview(
    productId: string, 
    reviewData: Omit<Review, 'id' | 'created_at' | 'helpful_count' | 'product_id'>, 
    token?: string
  ): Promise<Review> {
    // Validate rating
    const rating = Math.round(Number(reviewData.rating));
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    if (!reviewData.full_name?.trim()) {
      throw new Error('Name is required to submit a review');
    }

    if (!reviewData.comment?.trim()) {
      throw new Error('Comment is required to submit a review');
    }

    // Set default status to Approved (as in current mock schema)
    const cleanReview = {
      ...reviewData,
      rating,
      full_name: reviewData.full_name.trim(),
      title: reviewData.title?.trim() || 'Review',
      comment: reviewData.comment.trim(),
      status: 'Approved' // Auto-approve for simplified demo setup
    };

    return ReviewRepository.addReview(productId, cleanReview, token);
  }
}
