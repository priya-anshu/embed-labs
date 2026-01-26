/**
 * Supabase browser client for client-side operations.
 * 
 * This client is used in Client Components and should only be used
 * for operations that don't require server-side session validation.
 * For authenticated operations, prefer server-side clients.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );
}
