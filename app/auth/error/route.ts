/**
 * Auth error handler route.
 * 
 * Displays authentication errors to users.
 * This is a placeholder - actual error UI will be implemented later.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");

  // Placeholder response - UI will be implemented later
  return NextResponse.json(
    {
      error: error ?? "An authentication error occurred",
      message: "Please try again or contact support if the issue persists",
    },
    { status: 400 }
  );
}
