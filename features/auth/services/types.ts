/**
 * Authentication service type definitions.
 * 
 * Shared types for authentication operations.
 */

import type { AuthError } from "../types";

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: AuthError;
  message?: string;
}
