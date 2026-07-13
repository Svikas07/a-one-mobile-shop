// Centralized configuration and validation of server-side environment variables

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'aone-fallback-jwt-secret-key-2026',
};

// Log warning if critical database variables are missing
if (typeof window === 'undefined') {
  if (!env.supabaseUrl) {
    console.warn('⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL environment variable is missing.');
  }
  if (!env.supabaseAnonKey) {
    console.warn('⚠️ Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing.');
  }
}
