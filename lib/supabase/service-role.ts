/**
 * Supabase service role client for admin operations.
 *
 * SECURITY: This client bypasses RLS and should ONLY be used
 * for admin operations that require elevated privileges.
 *
 * NEVER use this client in user-facing code or client components.
 * This is server-side only and requires SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   const adminSupabase = createServiceRoleClient();
 *   await adminSupabase.from('qr_codes').update(...);
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Create a Supabase client with service role key.
 * This client bypasses all RLS policies.
 *
 * SECURITY: Only use for admin operations on the server.
 *
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL environment variable is required for admin operations"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations. " +
      "Please configure this in your environment variables. " +
      "This key is server-side only and should never be exposed to the client."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
