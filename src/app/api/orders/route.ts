import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { OrderService } from '@/server/services/order.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, token } = await getAuthUser(request);
    
    // User must be logged in to view their order listing via API
    if (!user) {
      return ApiResponse.unauthorized('Authentication is required to view order history');
    }
    
    // Query orders for this user (or guest email mapping)
    const orders = await OrderService.getUserOrders(user.id || user.email, token || undefined);
    return ApiResponse.success(orders);
  } catch (error: any) {
    console.error('API Error in GET /api/orders:', error);
    return ApiResponse.serverError(error?.message || 'Failed to retrieve orders');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, token } = await getAuthUser(request);
    
    // Inject authenticated user ID if logged in
    const orderData = {
      ...body,
      user_id: user ? user.id : body.user_id || null
    };
    
    const newOrder = await OrderService.createOrder(orderData, token || undefined);
    return ApiResponse.success(newOrder, 201);
  } catch (error: any) {
    console.error('API Error in POST /api/orders:', error);
    return ApiResponse.error(error?.message || 'Failed to place order');
  }
}
