/**
 * Server-side session validation and management.
 * 
 * Provides utilities for checking authentication state
 * and retrieving user sessions in Server Components and Actions.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthSession } from "../types";

/**
 * Get the current authenticated user session.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<AuthSession | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return null;
  }

  return {
    user,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ?? undefined,
    },
  };
}

/**
 * Check if the current request is authenticated.
 * Returns true if user session exists and is valid.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
