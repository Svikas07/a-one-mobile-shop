import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { CartService } from '@/server/services/cart.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;
    
    if (orderTotal === undefined || isNaN(Number(orderTotal))) {
      return ApiResponse.error('Valid orderTotal is required', 400);
    }
    
    const result = await CartService.validateCoupon(code, Number(orderTotal));
    return ApiResponse.success(result);
  } catch (error: any) {
    console.error('API Error in POST /api/coupons/validate:', error);
    return ApiResponse.error(error?.message || 'Failed to validate coupon');
  }
}
