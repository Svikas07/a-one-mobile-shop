import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AddressService } from '@/server/services/address.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, token } = await getAuthUser(request);
    if (!user) {
      return ApiResponse.unauthorized('Authentication is required to retrieve saved addresses');
    }
    
    const addresses = await AddressService.getUserAddresses(user.id, token || undefined);
    return ApiResponse.success(addresses);
  } catch (error: any) {
    console.error('API Error in GET /api/addresses:', error);
    return ApiResponse.serverError(error?.message || 'Failed to retrieve addresses');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, token } = await getAuthUser(request);
    if (!user) {
      return ApiResponse.unauthorized('Authentication is required to save addresses');
    }
    
    const savedAddress = await AddressService.saveUserAddress(body, user.id, token || undefined);
    return ApiResponse.success(savedAddress, 201);
  } catch (error: any) {
    console.error('API Error in POST /api/addresses:', error);
    return ApiResponse.error(error?.message || 'Failed to save address');
  }
}
