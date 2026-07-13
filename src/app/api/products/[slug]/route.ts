import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { ProductService } from '@/server/services/product.service';

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
    
    return ApiResponse.success(product);
  } catch (error: any) {
    console.error(`API Error in GET /api/products/${error}:`, error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch product details');
  }
}
