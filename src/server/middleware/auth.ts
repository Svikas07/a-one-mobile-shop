import { NextRequest } from 'next/server';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '@/context/AuthContext';

export async function getAuthUser(request: NextRequest): Promise<{ user: UserProfile | null; token: string | null }> {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return { user: null, token: null };
    }
    
    const token = authHeader.substring(7);
    const user = await AuthService.verifySession(token);
    return { user, token };
  } catch (error) {
    console.error('Session verification failed:', error);
    return { user: null, token: null };
  }
}
