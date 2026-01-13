/**
 * Server Actions for authentication.
 * 
 * These actions can be called from Client Components
 * and handle authentication operations server-side.
 * 
 * Usage:
 *   import { signUpAction, signInAction, signOutAction } from "@/features/auth/actions";
 */

"use server";

import { signUp, signIn, signOut } from "./services/auth";
import type {
  SignUpCredentials,
  SignInCredentials,
  AuthResult,
} from "./services/types";

/**
 * Server Action: Sign up a new user.
 */
export async function signUpAction(
  credentials: SignUpCredentials
): Promise<AuthResult> {
  return signUp(credentials);
}

/**
 * Server Action: Sign in an existing user.
 */
export async function signInAction(
  credentials: SignInCredentials
): Promise<AuthResult> {
  return signIn(credentials);
}

/**
 * Server Action: Sign out the current user.
 */
export async function signOutAction(): Promise<AuthResult> {
  return signOut();
}
