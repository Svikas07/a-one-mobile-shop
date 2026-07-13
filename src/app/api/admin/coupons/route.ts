import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { CouponRepository } from '@/server/repositories/coupon.repo';
import { getAuthUser } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthUser(request);
    
    if (!user || user.role !== 'Admin') {
      return ApiResponse.forbidden('Access denied: Administrator privileges required');
    }
    
    const coupons = await CouponRepository.getAdminCoupons();
    return ApiResponse.success(coupons);
  } catch (error: any) {
    console.error('API Error in GET /api/admin/coupons:', error);
    return ApiResponse.serverError(error?.message || 'Failed to retrieve coupons');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthUser(request);
    
    if (!user || user.role !== 'Admin') {
      return ApiResponse.forbidden('Access denied: Administrator privileges required');
    }
    
    const body = await request.json();
    
    // Auto-generate ID if not provided
    const couponPayload = {
      ...body,
      id: body.id || 'cp_' + Math.random().toString(36).substring(2, 11)
    };
    
    const saved = await CouponRepository.saveCoupon(couponPayload);
    return ApiResponse.success(saved, 201);
  } catch (error: any) {
    console.error('API Error in POST /api/admin/coupons:', error);
    return ApiResponse.error(error?.message || 'Failed to save coupon settings');
  }
}
