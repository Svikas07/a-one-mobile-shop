import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { WishlistService } from '@/server/services/wishlist.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, token } = await getAuthUser(request);
    
    // Authenticated users get DB wishlist, guests get blank (client handles guest wishlist fallback)
    if (!user) {
      return ApiResponse.success([]);
    }
    
    const wishlistIds = await WishlistService.getUserWishlist(user.id, token || undefined);
    return ApiResponse.success(wishlistIds);
  } catch (error: any) {
    console.error('API Error in GET /api/wishlist:', error);
    return ApiResponse.serverError(error?.message || 'Failed to retrieve wishlist');
  }
}
