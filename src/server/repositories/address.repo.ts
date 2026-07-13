import { createRequestClient } from '../config/supabase';
import { serverMockState } from '../config/mockData';
import { Address } from '@/lib/db';
import { env } from '../config/env';

export class AddressRepository {
  static async getAddresses(userId: string, token?: string): Promise<Address[]> {
    if (env.supabaseUrl && env.supabaseAnonKey && token) {
      try {
        const client = createRequestClient(token);
        const { data, error } = await client
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.error('Database error in getAddresses, falling back to mock storage:', e);
      }
    }
    return serverMockState.addresses.filter(a => a.email === userId || a.id === userId); // Match mock user email/ID mapping
  }

  static async saveAddress(address: Address, userId: string, token?: string): Promise<Address> {
    if (env.supabaseUrl && env.supabaseAnonKey && token) {
      try {
        const client = createRequestClient(token);
        
        // If is_default is true, set all other addresses of this user to is_default = false first
        if (address.is_default) {
          await client
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId);
        }
        
        const payload = {
          user_id: userId,
          full_name: address.full_name,
          phone_number: address.phone_number,
          email: address.email,
          house_no: address.house_no,
          street: address.street,
          area: address.area,
          landmark: address.landmark || null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country || 'India',
          address_type: address.address_type,
          is_default: address.is_default
        };

        let result;
        if (address.id && address.id.startsWith('addr_') === false && address.id.length > 20) {
          // It's a real UUID (existing database row)
          const { data, error } = await client
            .from('addresses')
            .update(payload)
            .eq('id', address.id)
            .select()
            .single();
            
          if (error) throw error;
          result = data;
        } else {
          // New insert
          const { data, error } = await client
            .from('addresses')
            .insert([payload])
            .select()
            .single();
            
          if (error) throw error;
          result = data;
        }
        
        if (result) return result;
      } catch (e) {
        console.error('Database error in saveAddress, falling back to mock storage:', e);
      }
    }

    // Mock handler
    let list = serverMockState.addresses;
    if (address.id) {
      list = list.map(a => {
        if (a.id === address.id) {
          return { ...a, ...address } as Address;
        }
        if (address.is_default) {
          return { ...a, is_default: false };
        }
        return a;
      });
      const index = list.findIndex(a => a.id === address.id);
      if (index > -1) {
        serverMockState.addresses = list;
        return list[index];
      }
    }
    
    const newId = 'addr_' + Math.random().toString(36).substring(2, 11);
    const newAddr = { ...address, id: newId } as Address;
    if (address.is_default) {
      list = list.map(a => ({ ...a, is_default: false }));
    }
    list.push(newAddr);
    serverMockState.addresses = list;
    return newAddr;
  }

  static async deleteAddress(addressId: string, userId: string, token?: string): Promise<void> {
    if (env.supabaseUrl && env.supabaseAnonKey && token) {
      try {
        const client = createRequestClient(token);
        const { error } = await client
          .from('addresses')
          .delete()
          .eq('id', addressId)
          .eq('user_id', userId);
          
        if (error) throw error;
        return;
      } catch (e) {
        console.error('Database error in deleteAddress, falling back to mock storage:', e);
      }
    }
    
    serverMockState.addresses = serverMockState.addresses.filter(a => a.id !== addressId);
  }
}
