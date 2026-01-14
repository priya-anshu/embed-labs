/**
 * Route protection utilities for middleware.
 * 
 * Provides helpers for checking authentication state
 * and protecting routes in middleware.
 */

import { createMiddlewareClient } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

/**
 * Check if the current request has a valid session.
 * Used in middleware for route protection.
 */
export async function hasValidSession(request: NextRequest): Promise<boolean> {
  const { supabase } = await createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user !== null;
}

/**
 * Get protected route patterns that require authentication.
 * Add routes here that should be protected.
 */
export const PROTECTED_ROUTES: string[] = [
  "/",
  "/dashboard",
  "/admin",
];

/**
 * Check if a path matches any protected route pattern.
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.includes(pathname);
}
