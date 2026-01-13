/**
 * Authentication utility functions.
 * 
 * Pure functions for auth-related operations that don't
 * require direct database access. Business logic should
 * live in services/, not here.
 */

import type { AuthError, AuthSession } from "./types";

/**
 * Normalizes Supabase auth errors into application error types.
 * This provides consistent error handling across the app.
 */
export function normalizeAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("unauthorized") || message.includes("401")) {
      return "UNAUTHORIZED";
    }
    if (message.includes("expired") || message.includes("token")) {
      return "SESSION_EXPIRED";
    }
    if (message.includes("invalid") || message.includes("credentials")) {
      return "INVALID_CREDENTIALS";
    }
    if (message.includes("not found") || message.includes("404")) {
      return "USER_NOT_FOUND";
    }
    if (message.includes("network") || message.includes("fetch")) {
      return "NETWORK_ERROR";
    }
  }

  return "UNKNOWN_ERROR";
}

/**
 * Validates that a session exists and is not expired.
 * This is a client-side check; server-side validation is required.
 */
export function isSessionValid(session: AuthSession | null): boolean {
  if (!session) return false;

  const { expires_at } = session.session;
  if (expires_at && expires_at < Date.now() / 1000) {
    return false;
  }

  return true;
}
