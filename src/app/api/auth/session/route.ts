import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { getAuthUser } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthUser(request);
    
    if (!user) {
      return ApiResponse.unauthorized('Invalid or expired session');
    }
    
    return ApiResponse.success(user);
  } catch (error: any) {
    console.error('API Error in GET /api/auth/session:', error);
    return ApiResponse.unauthorized('Session verification failed');
  }
}
