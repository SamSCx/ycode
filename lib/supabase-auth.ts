/**
 * Server-side auth utilities for API routes.
 * Creates a Supabase client from cookies and verifies the session.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { credentials } from '@/lib/credentials';
import { parseSupabaseConfig } from '@/lib/supabase-config-parser';
import { AuthRole, AUTH_ROLES } from './auth-constants';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { SupabaseConfig } from '@/types';

interface AuthResult {
  user: User;
  client: SupabaseClient;
}

/**
 * Get the authenticated user and Supabase client from request cookies.
 * Returns null if not authenticated or Supabase is not configured.
 */
export async function getAuthUser(options?: { role?: AuthRole }): Promise<AuthResult | null> {
  try {
    const config = await credentials.get<SupabaseConfig>('supabase_config');
    if (!config) return null;

    const parsed = parseSupabaseConfig(config);
    const cookieStore = await cookies();

    const client = createServerClient(parsed.projectUrl, parsed.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    });

    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;

    // Verify user role if specified
    if (options?.role) {
      const userRole = user.app_metadata?.role;
      if (userRole !== options.role) {
        return null;
      }
    }

    return { user, client };
  } catch {
    return null;
  }
}

/**
 * Get the authenticated project admin user.
 */
export async function getAdminUser(): Promise<AuthResult | null> {
  return getAuthUser({ role: AUTH_ROLES.ADMIN });
}

/**
 * Get the authenticated site user.
 * Allows both 'user' and 'admin' roles.
 */
export async function getSiteUser(): Promise<AuthResult | null> {
  const result = await getAuthUser();
  if (!result) return null;

  const role = result.user.app_metadata?.role;
  if (role === AUTH_ROLES.USER || role === AUTH_ROLES.ADMIN) {
    return result;
  }

  return null;
}
