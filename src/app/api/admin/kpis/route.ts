import { NextRequest } from 'next/server';
import { ApiResponse } from '@/server/utils/response';
import { AdminService } from '@/server/services/admin.service';
import { getAuthUser } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthUser(request);
    
    if (!user || user.role !== 'Admin') {
      return ApiResponse.forbidden('Access denied: Administrator privileges required');
    }
    
    const kpis = await AdminService.getAdminKPIs();
    return ApiResponse.success(kpis);
  } catch (error: any) {
    console.error('API Error in GET /api/admin/kpis:', error);
    return ApiResponse.serverError(error?.message || 'Failed to fetch KPIs');
  }
}
