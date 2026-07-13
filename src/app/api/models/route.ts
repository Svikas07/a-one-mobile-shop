import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { ProductService } from '@/server/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || undefined;
    const slug = searchParams.get('slug') || undefined;
    
    if (slug) {
      const model = await ProductService.getPhoneModelBySlug(slug);
      return ApiResponse.success(model);
    }
    
    const models = await ProductService.getPhoneModels(brandId);
    return ApiResponse.success(models);
  } catch (error: any) {
    console.error('API Error in GET /api/models:', error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch phone models');
  }
}
