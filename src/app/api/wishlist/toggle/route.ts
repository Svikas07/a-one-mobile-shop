import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { WishlistService } from '@/server/services/wishlist.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;
    
    if (!productId) {
      return ApiResponse.error('Product ID is required', 400);
    }
    
    const { user, token } = await getAuthUser(request);
    if (!user) {
      return ApiResponse.unauthorized('Authentication is required to manage a wishlist');
    }
    
    const updatedWishlist = await WishlistService.toggleWishlist(productId, user.id, token || undefined);
    return ApiResponse.success(updatedWishlist);
  } catch (error: any) {
    console.error('API Error in POST /api/wishlist/toggle:', error);
    return ApiResponse.error(error?.message || 'Failed to toggle wishlist item');
  }
}
