/**
 * Server-side session validation and management.
 * 
 * Provides utilities for checking authentication state
 * and retrieving user sessions in Server Components and Actions.
 */

import { createServerSupabaseClient, createApiSupabaseClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
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
 * 
 * Use this in Server Components and Server Actions.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Get the authenticated user session from an API Route Handler request.
 * Returns null if not authenticated.
 * 
 * Use this in API Route Handlers (Route Handlers).
 * 
 * Usage:
 *   export async function GET(request: NextRequest) {
 *     const user = await getCurrentUserFromRequest(request);
 *     if (!user) {
 *       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *     }
 *     // ... rest of handler
 *   }
 */
export async function getCurrentUserFromRequest(request: NextRequest) {
  const supabase = createApiSupabaseClient(request);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return user;
}
