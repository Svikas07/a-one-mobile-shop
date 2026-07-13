import { AddressRepository } from '../repositories/address.repo';
import { Address } from '@/lib/db';

export class AddressService {
  static async getUserAddresses(userId: string, token?: string): Promise<Address[]> {
    if (!userId) throw new Error('UserId is required');
    return AddressRepository.getAddresses(userId, token);
  }

  static async saveUserAddress(address: Address, userId: string, token?: string): Promise<Address> {
    if (!userId) throw new Error('UserId is required');
    
    // Basic field validation
    if (!address.full_name?.trim()) throw new Error('Full name is required');
    if (!address.phone_number?.trim()) throw new Error('Phone number is required');
    if (!address.house_no?.trim()) throw new Error('House/Shop number is required');
    if (!address.street?.trim()) throw new Error('Street/Road name is required');
    if (!address.city?.trim()) throw new Error('City is required');
    if (!address.state?.trim()) throw new Error('State is required');
    if (!address.pincode?.trim()) throw new Error('Pincode is required');
    
    const cleanAddress = {
      ...address,
      full_name: address.full_name.trim(),
      phone_number: address.phone_number.trim(),
      email: address.email?.trim() || '',
      house_no: address.house_no.trim(),
      street: address.street.trim(),
      area: address.area?.trim() || '',
      landmark: address.landmark?.trim() || '',
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      country: address.country?.trim() || 'India'
    };

    return AddressRepository.saveAddress(cleanAddress, userId, token);
  }

  static async deleteUserAddress(addressId: string, userId: string, token?: string): Promise<void> {
    if (!addressId) throw new Error('AddressId is required');
    if (!userId) throw new Error('UserId is required');
    return AddressRepository.deleteAddress(addressId, userId, token);
  }
}
