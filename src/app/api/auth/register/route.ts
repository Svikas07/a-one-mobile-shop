import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AuthService } from '@/server/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone } = body;
    
    if (!email || !password || !fullName || !phone) {
      return ApiResponse.error('All fields (email, password, fullName, phone) are required', 400);
    }
    
    const result = await AuthService.register(email, password, fullName, phone);
    return ApiResponse.success(result, 201);
  } catch (error: any) {
    console.error('API Error in POST /api/auth/register:', error);
    return ApiResponse.error(error?.message || 'Registration failed');
  }
}
