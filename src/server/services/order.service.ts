import { OrderRepository } from '../repositories/order.repo';
import { ProductRepository } from '../repositories/product.repo';
import { CartService } from './cart.service';
import { Order, Product } from '@/lib/db';

export class OrderService {
  static async createOrder(orderData: any, token?: string): Promise<Order> {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order items cannot be empty');
    }

    // 1. Fetch products from database to recalculate prices on the server
    const products = await ProductRepository.getProducts();
    let recalculatedSubtotal = 0;
    
    const validatedItems = orderData.items.map((item: any) => {
      const dbProd = products.find(p => p.id === item.product_id);
      if (!dbProd) {
        throw new Error(`Product not found: ${item.product_id}`);
      }
      
      if (dbProd.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${dbProd.product_name}. Available: ${dbProd.stock}`);
      }
      
      const itemPrice = dbProd.sale_price || dbProd.price;
      recalculatedSubtotal += itemPrice * item.quantity;
      
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_snapshot: itemPrice,
        compatibility_snapshot: item.compatibility_snapshot || dbProd.product_name
      };
    });

    // 2. Validate Coupon Server-side
    let verifiedDiscount = 0;
    if (orderData.coupon_code) {
      const couponVal = await CartService.validateCoupon(orderData.coupon_code, recalculatedSubtotal);
      if (couponVal.success) {
        verifiedDiscount = couponVal.discount;
      }
    }

    // 3. Compute Shipping Charges
    // Free shipping threshold = 499, standard shipping fee = 49
    let shipping = recalculatedSubtotal >= 499 ? 0 : 49;
    
    // Add extra fee if express shipping selected
    if (orderData.shipping_charges > 49) {
      shipping += 99; // Express shipping markup
    }
    
    // 4. Compute Grand Total
    const grandTotal = Math.max(0, recalculatedSubtotal + shipping - verifiedDiscount);

    // 5. Build secure cleaned order payload
    const cleanedOrderPayload = {
      user_id: orderData.user_id || null,
      guest_email: orderData.guest_email || null,
      subtotal: recalculatedSubtotal,
      gst_amount: Math.round(recalculatedSubtotal * 0.18 * 100) / 100,
      shipping_charges: shipping,
      coupon_code: verifiedDiscount > 0 ? orderData.coupon_code : null,
      discount_amount: verifiedDiscount,
      grand_total: grandTotal,
      payment_method: orderData.payment_method,
      address_snapshot: orderData.address_snapshot,
      items: validatedItems
    };

    return OrderRepository.createOrder(cleanedOrderPayload, token);
  }

  static async getUserOrders(userId: string, token?: string): Promise<Order[]> {
    if (!userId) throw new Error('UserId/Email is required');
    return OrderRepository.getOrders(userId, token);
  }

  static async getOrderDetails(orderNumber: string): Promise<Order | null> {
    if (!orderNumber) throw new Error('Order number is required');
    return OrderRepository.getOrderDetails(orderNumber);
  }

  static async trackOrder(orderNumber: string, contact: string): Promise<Order | null> {
    if (!orderNumber) throw new Error('Order number is required');
    if (!contact) throw new Error('Contact email/phone is required');
    return OrderRepository.trackOrder(orderNumber, contact);
  }
}
