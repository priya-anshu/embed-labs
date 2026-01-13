/**
 * OAuth authentication service.
 * 
 * Handles Google OAuth flow initiation and callback processing.
 * OAuth flow requires redirects, so this service coordinates
 * with route handlers for the complete flow.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthError } from "../types";
import { normalizeAuthError } from "../utils";

export interface OAuthResult {
  success: boolean;
  error?: AuthError;
  redirectUrl?: string;
  message?: string;
}

/**
 * Initiate Google OAuth sign-in flow.
 * Returns the OAuth redirect URL.
 */
export async function signInWithGoogle(): Promise<OAuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error || !data.url) {
      return {
        success: false,
        error: normalizeAuthError(error),
        message: error?.message ?? "Failed to initiate OAuth flow",
      };
    }

    return {
      success: true,
      redirectUrl: data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: normalizeAuthError(error),
      message: "An unexpected error occurred",
    };
  }
}
