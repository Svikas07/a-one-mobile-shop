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
    const { id: orderId } = resolvedParams;
    const body = await request.json();
    
    const updatedOrder = await AdminService.updateOrderStatus(orderId, body);
    return ApiResponse.success(updatedOrder);
  } catch (error: any) {
    console.error('API Error in PUT /api/admin/orders/[id]:', error);
    return ApiResponse.error(error?.message || 'Failed to update order status');
  }
}
