import { CouponRepository } from '../repositories/coupon.repo';

export class CartService {
  static async validateCoupon(code: string, orderTotal: number): Promise<{ success: boolean; discount: number; message: string }> {
    if (!code?.trim()) {
      return { success: false, discount: 0, message: 'Invalid Coupon Code' };
    }

    const coupons = await CouponRepository.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    
    if (!coupon) {
      return { success: false, discount: 0, message: 'Invalid Coupon Code' };
    }
    
    if (coupon.status !== 'Active') {
      return { success: false, discount: 0, message: 'Coupon is inactive' };
    }
    
    if (orderTotal < coupon.min_order_value) {
      return { success: false, discount: 0, message: `Minimum purchase of ₹${coupon.min_order_value} required` };
    }
    
    // Check expiry
    if (coupon.expiry_date) {
      const expiry = new Date(coupon.expiry_date);
      const now = new Date();
      if (expiry < now) {
        return { success: false, discount: 0, message: 'Coupon has expired' };
      }
    }
    
    let discount = 0;
    if (coupon.type === 'Percentage') {
      discount = (orderTotal * coupon.value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else if (coupon.type === 'Flat') {
      discount = coupon.value;
    }
    
    // Ensure discount doesn't exceed order total
    discount = Math.min(discount, orderTotal);

    return { success: true, discount, message: 'Coupon applied successfully!' };
  }
}
