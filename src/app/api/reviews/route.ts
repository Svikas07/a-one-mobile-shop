import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { ReviewService } from '@/server/services/review.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return ApiResponse.error('productId parameter is required', 400);
    }
    
    const reviews = await ReviewService.getProductReviews(productId);
    return ApiResponse.success(reviews);
  } catch (error: any) {
    console.error('API Error in GET /api/reviews:', error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch reviews');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, full_name, rating, title, comment, verified_purchase } = body;
    
    if (!productId) {
      return ApiResponse.error('productId is required', 400);
    }
    
    const { token } = await getAuthUser(request);
    
    const newReview = await ReviewService.submitReview(
      productId,
      {
        full_name,
        rating,
        title,
        comment,
        verified_purchase: !!verified_purchase
      },
      token || undefined
    );
    
    return ApiResponse.success(newReview, 201);
  } catch (error: any) {
    console.error('API Error in POST /api/reviews:', error);
    return ApiResponse.error(error?.message || 'Failed to submit review');
  }
}
