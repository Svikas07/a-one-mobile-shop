import { supabaseAdmin, supabasePublic } from '../config/supabase';
import { serverMockState, MOCK_MODELS, MOCK_PRODUCTS } from '../config/mockData';
import { ProductRepository } from '../repositories/product.repo';
import { OrderRepository } from '../repositories/order.repo';
import { CouponRepository } from '../repositories/coupon.repo';
import { Product, Order, Coupon } from '@/lib/db';
import { env } from '../config/env';

export class AdminService {
  static async getAdminKPIs(): Promise<{
    revenue: number;
    ordersCount: number;
    productsCount: number;
    lowStockCount: number;
    pendingCount: number;
    recentOrders: Order[];
    salesChart: { label: string; value: number }[];
  }> {
    const list = await OrderRepository.getOrders();
    const products = await ProductRepository.getProducts();

    const revenue = list
      .filter(o => o.order_status !== 'Cancelled')
      .reduce((sum, o) => sum + o.grand_total, 0);

    const lowStockCount = products.filter(p => p.stock <= p.low_stock_limit).length;
    const pendingCount = list.filter(o => o.order_status === 'Pending').length;

    // Last 7 orders/sales chart
    const salesChart = list.slice(0, 7).reverse().map(o => ({
      label: o.order_number,
      value: o.grand_total
    }));

    return {
      revenue,
      ordersCount: list.length,
      productsCount: products.length,
      lowStockCount,
      pendingCount,
      recentOrders: list.slice(0, 5),
      salesChart
    };
  }

  static async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    if (env.supabaseUrl && env.supabaseAnonKey && supabaseAdmin) {
      try {
        const productPayload = {
          product_name: productData.product_name,
          slug: productData.slug,
          category_id: productData.category_id,
          brand_id: productData.brand_id,
          sku: productData.sku,
          short_description: productData.short_description,
          full_description: productData.full_description,
          price: productData.price,
          sale_price: productData.sale_price || null,
          stock: productData.stock,
          low_stock_limit: productData.low_stock_limit,
          status: productData.status,
          featured: productData.featured,
          best_seller: productData.best_seller,
          new_arrival: productData.new_arrival,
          trending: productData.trending,
          material: productData.material || null,
          finish: productData.finish || null,
          color: productData.color || null,
          charging_speed: productData.charging_speed || null,
          connector_type: productData.connector_type || null,
          cable_length: productData.cable_length || null,
          output_power: productData.output_power || null,
          warranty: productData.warranty || null,
          package_contents: productData.package_contents || null,
          installation_guide: productData.installation_guide || null,
          images: productData.images || []
        };

        // Insert product
        const { data: prodRow, error: prodError } = await supabaseAdmin
          .from('products')
          .insert([productPayload])
          .select()
          .single();
          
        if (prodError) throw prodError;

        // Insert compatibilities
        if (productData.compatibility && productData.compatibility.length > 0) {
          const compatRows = productData.compatibility.map(mid => ({
            product_id: prodRow.id,
            phone_model_id: mid
          }));
          const { error: compatError } = await supabaseAdmin
            .from('compatibility')
            .insert(compatRows);
          if (compatError) throw compatError;
        }

        return {
          ...prodRow,
          compatibility: productData.compatibility
        };
      } catch (e) {
        console.error('Database adminCreateProduct error, falling back to mock:', e);
      }
    }

    const newProduct: Product = {
      ...productData,
      id: 'p_' + Math.random().toString(36).substring(2, 11)
    };
    serverMockState.products.unshift(newProduct);
    return newProduct;
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    if (env.supabaseUrl && env.supabaseAnonKey && supabaseAdmin) {
      try {
        const productPayload: any = { ...productData };
        delete productPayload.id;
        delete productPayload.compatibility;
        delete productPayload.created_at;
        delete productPayload.updated_at;

        // Update product table
        const { data: prodRow, error: prodError } = await supabaseAdmin
          .from('products')
          .update(productPayload)
          .eq('id', id)
          .select()
          .single();
          
        if (prodError) throw prodError;

        // Update compatibility relation if supplied
        if (productData.compatibility !== undefined) {
          // Delete old
          await supabaseAdmin
            .from('compatibility')
            .delete()
            .eq('product_id', id);
            
          // Insert new
          if (productData.compatibility.length > 0) {
            const compatRows = productData.compatibility.map(mid => ({
              product_id: id,
              phone_model_id: mid
            }));
            const { error: compatError } = await supabaseAdmin
              .from('compatibility')
              .insert(compatRows);
            if (compatError) throw compatError;
          }
        }

        return {
          ...prodRow,
          compatibility: productData.compatibility || []
        };
      } catch (e) {
        console.error('Database adminUpdateProduct error, falling back to mock:', e);
      }
    }

    serverMockState.products = serverMockState.products.map(p => {
      if (p.id === id) {
        return { ...p, ...productData } as Product;
      }
      return p;
    });
    
    return serverMockState.products.find(p => p.id === id)!;
  }

  static async deleteProduct(id: string): Promise<void> {
    if (env.supabaseUrl && env.supabaseAnonKey && supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return;
      } catch (e) {
        console.error('Database adminDeleteProduct error, falling back to mock:', e);
      }
    }

    serverMockState.products = serverMockState.products.filter(p => p.id !== id);
  }

  static async updateOrderStatus(
    orderId: string, 
    updates: {
      order_status?: Order['order_status'];
      payment_status?: Order['payment_status'];
      tracking_number?: string;
      courier_name?: string;
    }
  ): Promise<Order> {
    if (env.supabaseUrl && env.supabaseAnonKey && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('orders')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select('*, items:order_items(*)')
          .single();
          
        if (error) throw error;
        return data;
      } catch (e) {
        console.error('Database adminUpdateOrderStatus error, falling back to mock:', e);
      }
    }

    serverMockState.orders = serverMockState.orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          ...updates,
          updated_at: new Date().toISOString()
        } as Order;
      }
      return o;
    });

    return serverMockState.orders.find(o => o.id === orderId)!;
  }
}
