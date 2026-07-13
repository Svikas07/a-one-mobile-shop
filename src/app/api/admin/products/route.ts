import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AdminService } from '@/server/services/admin.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthUser(request);
    
    if (!user || user.role !== 'Admin') {
      return ApiResponse.forbidden('Access denied: Administrator privileges required');
    }
    
    const body = await request.json();
    const newProduct = await AdminService.createProduct(body);
    return ApiResponse.success(newProduct, 201);
  } catch (error: any) {
    console.error('API Error in POST /api/admin/products:', error);
    return ApiResponse.error(error?.message || 'Failed to create product');
  }
}
