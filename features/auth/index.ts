/**
 * Auth feature public API.
 * 
 * This barrel export provides a clean interface for other
 * parts of the application to interact with auth functionality.
 * 
 * Following the single responsibility principle, this file
 * only re-exports public APIs, keeping the feature's
 * internal structure hidden.
 */

export type { AuthUser, AuthSession, AuthError } from "./types";
export { normalizeAuthError, isSessionValid } from "./utils";

// Server-side session utilities
export {
  getSession,
  isAuthenticated,
  getCurrentUser,
} from "./services/session";

// Server Actions
export {
  signUpAction,
  signInAction,
  signOutAction,
} from "./actions";

// Service types
export type {
  SignUpCredentials,
  SignInCredentials,
  AuthResult,
} from "./services/types";

// Role resolution
export type { UserRole } from "./services/role";
export { getCurrentUserRole } from "./services/role";
