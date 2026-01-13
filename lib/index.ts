/**
 * Library public API.
 * 
 * Central export point for commonly used utilities and clients.
 * This keeps imports clean and maintainable.
 */

export { createClient } from "./supabase/client";
export { createServerSupabaseClient } from "./supabase/server";
export { createMiddlewareClient } from "./supabase/middleware";
export type { Database } from "./supabase/types";
