/**
 * Next.js middleware for route protection and session validation.
 * 
 * This middleware runs on the edge before requests reach Server Components.
 * It validates sessions and protects routes that require authentication.
 * 
 * Currently, no routes are protected (PROTECTED_ROUTES is empty).
 * Add routes to PROTECTED_ROUTES in features/auth/utils/route-protection.ts
 * to enable protection.
 */

import { type NextRequest, NextResponse } from "next/server";
import { isProtectedRoute, hasValidSession } from "@/features/auth/utils/route-protection";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip protection for auth routes and public assets
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    const isValid = await hasValidSession(request);

    if (!isValid) {
      const redirectUrl = new URL("/auth/signin", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
