/**
 * Role resolution service.
 *
 * SECURITY-FIRST:
 * - Role check is server-side only.
 * - Current implementation uses Supabase auth metadata.
 * - Future implementation will use a profiles table (not created yet).
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type UserRole = "user" | "admin";

/**
 * Get the current user's role.
 *
 * ASSUMPTION (temporary):
 * - Role is stored in user.app_metadata.role or user.user_metadata.role.
 * - Defaults to "user" when not set.
 * - Will be replaced by a profiles table lookup in the future.
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

