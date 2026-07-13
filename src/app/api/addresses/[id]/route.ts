import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AddressService } from '@/server/services/address.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: addressId } = resolvedParams;
    
    if (!addressId) {
      return ApiResponse.error('Address ID is required', 400);
    }
    
    const body = await request.json();
    const { user, token } = await getAuthUser(request);
    
    if (!user) {
      return ApiResponse.unauthorized('Authentication is required to edit addresses');
    }
    
    const addressData = {
      ...body,
      id: addressId
    };
    
    const updated = await AddressService.saveUserAddress(addressData, user.id, token || undefined);
    return ApiResponse.success(updated);
  } catch (error: any) {
    console.error('API Error in PUT /api/addresses/[id]:', error);
    return ApiResponse.error(error?.message || 'Failed to update address');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: addressId } = resolvedParams;
    
    if (!addressId) {
      return ApiResponse.error('Address ID is required', 400);
    }
    
    const { user, token } = await getAuthUser(request);
    if (!user) {
      return ApiResponse.unauthorized('Authentication is required to delete addresses');
    }
    
    await AddressService.deleteUserAddress(addressId, user.id, token || undefined);
    return ApiResponse.success({ message: 'Address deleted successfully' });
  } catch (error: any) {
    console.error('API Error in DELETE /api/addresses/[id]:', error);
    return ApiResponse.error(error?.message || 'Failed to delete address');
  }
}
