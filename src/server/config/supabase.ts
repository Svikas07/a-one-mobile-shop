import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Server-side Admin client: Bypasses Row Level Security (RLS).
// Strictly for admin control panels, secure service operations, and system sync events.
export const supabaseAdmin = env.supabaseUrl && env.supabaseServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Server-side Public/Anon client: Subject to RLS.
export const supabasePublic = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Creates a request-specific Supabase client that carries the user's JWT access token.
 * This is crucial to enforce database-level RLS policies on the server side.
 */
export const createRequestClient = (authToken?: string) => {
  if (!authToken) return supabasePublic;
  
  return createClient(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseAnonKey || 'placeholder-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};
