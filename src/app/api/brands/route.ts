import { ApiResponse } from '@/server/utils/response';
import { ProductService } from '@/server/services/product.service';

export async function GET() {
  try {
    const brands = await ProductService.getBrands();
    return ApiResponse.success(brands);
  } catch (error: any) {
    console.error('API Error in GET /api/brands:', error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch brands');
  }
}
