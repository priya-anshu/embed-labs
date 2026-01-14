/**
 * Server actions for authentication UI.
 *
 * These wrap the auth feature actions to keep UI layer simple.
 */

"use server";

import { signInAction } from "@/features/auth";
import type { AuthResult, SignInCredentials } from "@/features/auth";

export interface LoginActionResult {
  success: boolean;
  error?: string;
}

/**
 * Email/password login action.
 * Validates minimal input and delegates to auth service.
 */
export async function loginWithEmail(
  formData: FormData
): Promise<LoginActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const credentials: SignInCredentials = { email, password };
  const result: AuthResult = await signInAction(credentials);

  if (!result.success) {
    return {
      success: false,
      error: result.message ?? "Invalid credentials.",
    };
  }

  return { success: true };
}

