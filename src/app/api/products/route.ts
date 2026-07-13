import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { ProductService } from '@/server/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const brandId = searchParams.get('brandId') || undefined;
    const modelId = searchParams.get('modelId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const material = searchParams.get('material') || undefined;
    const finish = searchParams.get('finish') || undefined;
    const color = searchParams.get('color') || undefined;
    const speed = searchParams.get('speed') || undefined;
    const searchQuery = searchParams.get('searchQuery') || undefined;
    const sort = searchParams.get('sort') || undefined;
    
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
    
    const filters = {
      brandId,
      modelId,
      categoryId,
      material,
      finish,
      color,
      speed,
      minPrice,
      maxPrice,
      searchQuery,
      sort
    };
    
    const products = await ProductService.getProducts(filters);
    return ApiResponse.success(products);
  } catch (error: any) {
    console.error('API Error in GET /api/products:', error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch products');
  }
}
