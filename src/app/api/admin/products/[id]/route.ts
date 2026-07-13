import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AdminService } from '@/server/services/admin.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthUser(request);
    if (!user || user.role !== 'Admin') {
      return ApiResponse.forbidden('Access denied: Administrator privileges required');
    }
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    const updated = await AdminService.updateProduct(id, body);
    return ApiResponse.success(updated);
  } catch (error: any) {
    console.error('API Error in PUT /api/admin/products/[id]:', error);
    return ApiResponse.error(error?.message || 'Failed to update product');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthUser(request);
    if (!user || user.role !== 'Admin') {
      return ApiResponse.forbidden('Access denied: Administrator privileges required');
    }
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    await AdminService.deleteProduct(id);
    return ApiResponse.success({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('API Error in DELETE /api/admin/products/[id]:', error);
    return ApiResponse.error(error?.message || 'Failed to delete product');
  }
}
