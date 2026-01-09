import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get("logged_in")?.value;
  const role = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  // Allow public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/verify")) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/learn", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/learn/:path*", "/admin/:path*"],
};
