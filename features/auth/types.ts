/**
 * Authentication-related type definitions.
 * 
 * These types are used across the auth feature to maintain
 * type safety and consistency. They extend Supabase's built-in
 * auth types where needed.
 */

import type { User } from "@supabase/supabase-js";

/**
 * Extended user type with application-specific metadata.
 * This will be populated when user profiles are implemented.
 */
export interface AuthUser extends User {
  // Application-specific user properties will be added here
  // when the user profile schema is defined
}

/**
 * Authentication session result.
 * Used for type-safe session validation across the app.
 */
export interface AuthSession {
  user: AuthUser;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  };
}

/**
 * Authentication error types for better error handling.
 */
export type AuthError =
  | "UNAUTHORIZED"
  | "SESSION_EXPIRED"
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";
