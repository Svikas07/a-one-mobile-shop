import { supabasePublic, supabaseAdmin, createRequestClient } from '../config/supabase';
import { serverMockState } from '../config/mockData';
import { Order, OrderItem } from '@/lib/db';
import { env } from '../config/env';

export class OrderRepository {
  static async createOrder(
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'order_status' | 'payment_status'>,
    token?: string
  ): Promise<Order> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AO-${new Date().getFullYear()}-${randomSuffix}`;
    const paymentStatus = orderData.payment_method === 'COD' ? 'Pending' : 'Captured';
    
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const client = supabaseAdmin || createRequestClient(token);
        
        // 1. Insert order header
        const { data: orderRow, error: orderError } = await client
          .from('orders')
          .insert([{
            user_id: orderData.user_id || null,
            order_number: orderNumber,
            subtotal: orderData.subtotal,
            shipping_charges: orderData.shipping_charges,
            discount_amount: orderData.discount_amount,
            grand_total: orderData.grand_total,
            order_status: 'Pending',
            payment_method: orderData.payment_method,
            payment_status: paymentStatus,
            address_snapshot: orderData.address_snapshot
          }])
          .select()
          .single();
          
        if (orderError) throw orderError;
        
        // 2. Insert order line items (this fires Postgres stock decrement trigger)
        const itemRows = orderData.items.map(item => ({
          order_id: orderRow.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          compatibility_snapshot: item.compatibility_snapshot || ''
        }));
        
        const { error: itemsError } = await client
          .from('order_items')
          .insert(itemRows);
          
        if (itemsError) throw itemsError;
        
        return {
          ...orderRow,
          items: orderData.items
        };
      } catch (e) {
        console.error('Database error in createOrder, falling back to mock memory storage:', e);
      }
    }
    
    // Mock handler
    const newOrder: Order = {
      ...orderData,
      id: 'ord_' + Math.random().toString(36).substring(2, 11),
      order_number: orderNumber,
      order_status: 'Pending',
      payment_status: paymentStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Decrement local inventory
    for (const item of newOrder.items) {
      serverMockState.products = serverMockState.products.map(p => {
        if (p.id === item.product_id) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      });
    }
    
    serverMockState.orders.unshift(newOrder);
    return newOrder;
  }

  static async getOrders(userId?: string, token?: string): Promise<Order[]> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const client = supabaseAdmin || createRequestClient(token);
        let query = client.from('orders').select('*, items:order_items(*)');
        
        if (userId) {
          query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getOrders, falling back to mock data:', e);
      }
    }
    
    let list = serverMockState.orders;
    if (userId) {
      list = list.filter(o => o.user_id === userId || o.guest_email === userId || o.address_snapshot?.email === userId);
    }
    return list;
  }

  static async getOrderDetails(orderNumber: string): Promise<Order | null> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const client = supabaseAdmin || supabasePublic;
        const { data, error } = await client
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('order_number', orderNumber)
          .maybeSingle();
          
        if (error) throw error;
        return data;
      } catch (e) {
        console.error('Database error in getOrderDetails, falling back to mock data:', e);
      }
    }
    
    return serverMockState.orders.find(o => o.order_number === orderNumber) || null;
  }

  static async trackOrder(orderNumber: string, contact: string): Promise<Order | null> {
    if (env.supabaseUrl && env.supabaseAnonKey) {
      try {
        const client = supabaseAdmin || supabasePublic;
        const { data, error } = await client
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('order_number', orderNumber)
          .maybeSingle();
          
        if (error) throw error;
        if (data) {
          // Perform email/phone check on the server side
          const emailMatch = data.address_snapshot?.email?.toLowerCase() === contact.toLowerCase();
          const phoneMatch = data.address_snapshot?.phone_number === contact;
          if (emailMatch || phoneMatch || data.guest_email?.toLowerCase() === contact.toLowerCase()) {
            return data;
          }
        }
        return null;
      } catch (e) {
        console.error('Database error in trackOrder, falling back to mock data:', e);
      }
    }
    
    const order = serverMockState.orders.find(o => o.order_number === orderNumber);
    if (order) {
      const emailMatch = order.address_snapshot?.email?.toLowerCase() === contact.toLowerCase();
      const phoneMatch = order.address_snapshot?.phone_number === contact;
      if (emailMatch || phoneMatch || order.guest_email?.toLowerCase() === contact.toLowerCase()) {
        return order;
      }
    }
    return null;
  }
}
