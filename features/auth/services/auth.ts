/**
 * Authentication service - Server-side auth operations.
 * 
 * Handles email/password authentication flows.
 * All operations are server-side only for security.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeAuthError } from "../utils";
import type {
  SignUpCredentials,
  SignInCredentials,
  AuthResult,
} from "./types";

/**
 * Sign up a new user with email and password.
 */

export async function signUp(
  credentials: SignUpCredentials
): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: normalizeAuthError(error),
        message: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: normalizeAuthError(error),
      message: "An unexpected error occurred",
    };
  }
}

/**
 * Sign in an existing user with email and password.
 */
export async function signIn(
  credentials: SignInCredentials
): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: normalizeAuthError(error),
        message: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: normalizeAuthError(error),
      message: "An unexpected error occurred",
    };
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: normalizeAuthError(error),
        message: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: normalizeAuthError(error),
      message: "An unexpected error occurred",
    };
  }
}
