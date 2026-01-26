/**
 * Role resolution service.
 *
 * SECURITY-FIRST:
 * - Role check is server-side only.
 * - Current implementation uses Supabase auth metadata.
 * - Future implementation will use a profiles table (not created yet).
 */

import { createServerSupabaseClient, createApiSupabaseClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export type UserRole = "user" | "admin";

/**
 * Get the current user's role.
 *
 * ASSUMPTION (temporary):
 * - Role is stored in user.app_metadata.role or user.user_metadata.role.
 * - Defaults to "user" when not set.
 * - Will be replaced by a profiles table lookup in the future.
 * 
 * Use this in Server Components and Server Actions.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const metaRole =
    (user.app_metadata as { role?: string } | null)?.role ??
    (user.user_metadata as { role?: string } | null)?.role;

  if (metaRole === "admin") {
    return "admin";
  }

  return "user";
}

/**
 * Get the current user's role from an API Route Handler request.
 * 
 * Use this in API Route Handlers (Route Handlers).
 */
export async function getCurrentUserRoleFromRequest(request: NextRequest): Promise<UserRole | null> {
  const supabase = createApiSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const metaRole =
    (user.app_metadata as { role?: string } | null)?.role ??
    (user.user_metadata as { role?: string } | null)?.role;

  if (metaRole === "admin") {
    return "admin";
  }

  return "user";
}

