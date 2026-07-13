import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { OrderService } from '@/server/services/order.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: orderNumber } = resolvedParams;
    
    if (!orderNumber) {
      return ApiResponse.error('Order number is required', 400);
    }
    
    const order = await OrderService.getOrderDetails(orderNumber);
    if (!order) {
      return ApiResponse.notFound('Order not found');
    }
    
    return ApiResponse.success(order);
  } catch (error: any) {
    console.error('API Error in GET /api/orders/[id]:', error);
    return ApiResponse.serverError(error?.message || 'Failed to retrieve order details');
  }
}
