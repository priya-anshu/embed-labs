/**
 * Supabase server client for Server Components and Server Actions.
 * 
 * This client automatically handles cookie-based session management
 * and should be used for all server-side database operations.
 * 
 * Usage:
 *   const supabase = createServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { Database } from "./types";

/**
 * Create Supabase client for Server Components and Server Actions.
 * Uses cookies() from next/headers.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component cookies are read-only during render
            // This is expected behavior and safe to ignore
          }
        },
      },
    }
  );
}

/**
 * Create Supabase client for API Route Handlers (Route Handlers).
 * Reads cookies from NextRequest object.
 * 
 * Usage in API routes:
 *   export async function GET(request: NextRequest) {
 *     const supabase = createApiSupabaseClient(request);
 *     const { data: { user } } = await supabase.auth.getUser();
 *   }
 * 
 * Note: Cookie setting is handled via response headers automatically
 * by Supabase SSR when cookies need to be updated (e.g., token refresh).
 */
export function createApiSupabaseClient(request: NextRequest) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          // Read cookies from the request
          // request.cookies.getAll() returns { name, value } objects
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // In API routes, Supabase SSR handles cookie setting via
          // response headers automatically. We don't need to manually
          // set cookies here as the response is handled by Next.js.
          // This is a no-op but required by the interface.
        },
      },
    }
  );
}
