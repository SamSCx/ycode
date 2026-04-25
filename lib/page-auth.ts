import type { Page, PageFolder } from '@/types';
import { createHmac, randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-server';

/**
 * Page Password Protection Utilities
 *
 * Handles password-based access control for pages and folders.
 * Uses session cookies to track which pages/folders have been unlocked.
 * Uses dynamic import for cookies() to avoid tainting the module as dynamic.
 */

/** Cookie name for page authentication - exported for use in API routes */
export const PAGE_AUTH_COOKIE_NAME = 'ycode_page_auth';

const fallbackSecret = randomUUID();
let hasWarnedMissingSecret = false;

/**
 * Get the signing secret from environment.
 * Falls back to a per-process random value if PAGE_AUTH_SECRET is not set,
 * which means auth cookies won't persist across server restarts.
 */
function getSigningSecret(): string {
  const secret = process.env.PAGE_AUTH_SECRET;
  if (!secret) {
    if (!hasWarnedMissingSecret && process.env.NODE_ENV === 'production') {
      console.warn('[page-auth] PAGE_AUTH_SECRET is not set. Page password protection is using a temporary secret that resets on each deploy. Set PAGE_AUTH_SECRET in your environment variables (generate with: openssl rand -hex 32).');
      hasWarnedMissingSecret = true;
    }
    return fallbackSecret;
  }
  return secret;
}

/**
 * Sign a value using HMAC-SHA256
 */
function signValue(value: string): string {
  const secret = getSigningSecret();
  const hmac = createHmac('sha256', secret);
  hmac.update(value);
  return hmac.digest('hex');
}

/**
 * Verify a signed value
 */
function verifySignature(value: string, signature: string): boolean {
  const expectedSignature = signValue(value);
  return signature === expectedSignature;
}

/**
 * Cookie payload structure
 */
interface PageAuthCookie {
  // Array of unlocked page IDs
  pages: string[];
  // Array of unlocked folder IDs
  folders: string[];
}

/**
 * Parse the auth cookie and verify signature
 */
export async function parseAuthCookie(): Promise<PageAuthCookie | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookie = cookieStore.get(PAGE_AUTH_COOKIE_NAME);

    if (!cookie?.value) {
      return null;
    }

    // Cookie format: base64(json).signature
    const parts = cookie.value.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, signature] = parts;

    // Verify signature
    if (!verifySignature(encodedPayload, signature)) {
      return null;
    }

    // Decode and parse
    const jsonPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonPayload) as PageAuthCookie;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Build a signed cookie value
 */
export function buildAuthCookieValue(payload: PageAuthCookie): string {
  const jsonPayload = JSON.stringify(payload);
  const encodedPayload = Buffer.from(jsonPayload).toString('base64');
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/**
 * Protection result from checking a page/folder
 */
export interface PageProtectionResult {
  /** Whether the page is protected */
  isProtected: boolean;
  /** The type of protection */
  type?: 'password' | 'login';
  /** The password required (only set if protected by password) */
  password?: string;
  /** Whether protection comes from page or folder */
  protectedBy?: 'page' | 'folder';
  /** The ID of the page or folder that has the protection */
  protectedById?: string;
  /** Whether the current session has unlocked this protection */
  isUnlocked: boolean;
}

/**
 * Get the effective protection for a page
 * 
 * Priority:
 * 1. Page's own protection (if enabled)
 * 2. Parent folder's protection (traverse up, closest folder wins)
 * 
 * @param page - The page to check
 * @param folders - All folders for hierarchy lookup
 * @param authCookie - Current auth cookie payload (null if dry-run for static rendering)
 */
export async function getPageProtection(
  page: Page,
  folders: PageFolder[],
  authCookie: PageAuthCookie | null
): Promise<PageProtectionResult> {
  const isDryRun = authCookie === null;

  const checkProtection = async (
    settings: any,
    id: string,
    type: 'page' | 'folder'
  ): Promise<PageProtectionResult | null> => {
    if (settings?.auth?.enabled) {
      if (settings.auth.type === 'login') {
        let isUnlocked = false;
        if (!isDryRun) {
          const { getAuthUser } = await import('@/lib/supabase-auth');
          const authUser = await getAuthUser();
          isUnlocked = !!authUser;
        }
        return {
          isProtected: true,
          type: 'login',
          protectedBy: type,
          protectedById: id,
          isUnlocked,
        };
      } else {
        let isUnlocked = false;
        if (!isDryRun && authCookie) {
          isUnlocked = type === 'page' 
            ? (authCookie.pages?.includes(id) ?? false)
            : (authCookie.folders?.includes(id) ?? false);
        }
        return {
          isProtected: true,
          type: 'password',
          password: settings.auth.password,
          protectedBy: type,
          protectedById: id,
          isUnlocked,
        };
      }
    }
    return null;
  };

  // Check if page itself has protection
  const pageResult = await checkProtection(page.settings, page.id, 'page');
  if (pageResult) return pageResult;

  // Traverse folder hierarchy from page's parent folder up to root
  let currentFolderId = page.page_folder_id;
  
  while (currentFolderId) {
    const folder = folders.find(f => f.id === currentFolderId);
    if (!folder) break;

    const folderResult = await checkProtection(folder.settings, folder.id, 'folder');
    if (folderResult) return folderResult;

    // Move to parent folder
    currentFolderId = folder.page_folder_id;
  }

  // No password protection
  return {
    isProtected: false,
    isUnlocked: true,
  };
}

/**
 * Fetch folders for password protection checks
 * 
 * @param isPublished - If true, fetch only published folders. If false, fetch all (for preview).
 * @returns Array of page folders
 */
export async function fetchFoldersForAuth(isPublished: boolean): Promise<PageFolder[]> {
  const supabase = await getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from('page_folders')
    .select('*')
    .is('deleted_at', null);

  if (isPublished) {
    query = query.eq('is_published', true);
  }

  const { data } = await query;
  return (data as PageFolder[]) || [];
}
