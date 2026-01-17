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
 */
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations"
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
