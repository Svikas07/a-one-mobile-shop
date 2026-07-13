import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { ProductService } from '@/server/services/product.service';
import { ReviewService } from '@/server/services/review.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      return ApiResponse.error('Slug parameter is required', 400);
    }
    
    const product = await ProductService.getProductBySlug(slug);
    if (!product) {
      return ApiResponse.notFound('Product not found');
    }
    
    const reviews = await ReviewService.getProductReviews(product.id);
    return ApiResponse.success(reviews);
  } catch (error: any) {
    console.error(`API Error in GET /api/products/[slug]/reviews:`, error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch reviews');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      return ApiResponse.error('Slug parameter is required', 400);
    }
    
    const product = await ProductService.getProductBySlug(slug);
    if (!product) {
      return ApiResponse.notFound('Product not found');
    }
    
    const body = await request.json();
    const { full_name, rating, title, comment, verified_purchase } = body;
    
    // Extract Authorization header to forward to Supabase if authenticated
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    
    const newReview = await ReviewService.submitReview(
      product.id,
      {
        full_name,
        rating,
        title,
        comment,
        verified_purchase: !!verified_purchase,
      },
      token
    );
    
    return ApiResponse.success(newReview, 21);
  } catch (error: any) {
    console.error(`API Error in POST /api/products/[slug]/reviews:`, error);
    return ApiResponse.error(error?.message || 'Failed to submit review');
  }
}
