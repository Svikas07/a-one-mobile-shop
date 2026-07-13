import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { OrderService } from '@/server/services/order.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, contact } = body;
    
    if (!orderNumber || !contact) {
      return ApiResponse.error('Order number and contact information (phone or email) are required', 400);
    }
    
    const order = await OrderService.trackOrder(orderNumber, contact);
    if (!order) {
      return ApiResponse.notFound('No matching order found with the provided details');
    }
    
    return ApiResponse.success(order);
  } catch (error: any) {
    console.error('API Error in POST /api/orders/track:', error);
    return ApiResponse.serverError(error?.message || 'Failed to track order');
  }
}
