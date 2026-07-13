import { ApiResponse } from '@/server/utils/response';
import { ProductService } from '@/server/services/product.service';

export async function GET() {
  try {
    const categories = await ProductService.getCategories();
    return ApiResponse.success(categories);
  } catch (error: any) {
    console.error('API Error in GET /api/categories:', error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch categories');
  }
}
