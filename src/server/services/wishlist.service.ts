import { WishlistRepository } from '../repositories/wishlist.repo';

export class WishlistService {
  static async getUserWishlist(userId: string, token?: string): Promise<string[]> {
    if (!userId) throw new Error('UserId is required');
    return WishlistRepository.getWishlist(userId, token);
  }

  static async toggleWishlist(productId: string, userId: string, token?: string): Promise<string[]> {
    if (!productId) throw new Error('ProductId is required');
    if (!userId) throw new Error('UserId is required');
    return WishlistRepository.toggleWishlist(productId, userId, token);
  }
}
