import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AuthService } from '@/server/services/auth.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function PUT(request: NextRequest) {
  try {
    const { user, token } = await getAuthUser(request);
    
    if (!user || !token) {
      return ApiResponse.unauthorized('Authentication is required to update profile');
    }
    
    const body = await request.json();
    const { full_name, phone_number } = body;
    
    if (!full_name && !phone_number) {
      return ApiResponse.error('No profile updates specified', 400);
    }
    
    const updatedUser = await AuthService.updateProfile(
      user.id,
      {
        full_name: full_name || undefined,
        phone: phone_number || undefined
      },
      token
    );
    
    return ApiResponse.success(updatedUser);
  } catch (error: any) {
    console.error('API Error in PUT /api/auth/profile:', error);
    return ApiResponse.error(error?.message || 'Failed to update profile details');
  }
}
