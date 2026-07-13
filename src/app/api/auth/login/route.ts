import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AuthService } from '@/server/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return ApiResponse.error('Email and password are required', 400);
    }
    
    const result = await AuthService.login(email, password);
    return ApiResponse.success(result);
  } catch (error: any) {
    console.error('API Error in POST /api/auth/login:', error);
    return ApiResponse.error(error?.message || 'Login failed');
  }
}
