/**
 * Google OAuth initiation route.
 * 
 * Initiates the Google OAuth flow and redirects the user
 * to Google's authentication page.
 */

import { signInWithGoogle } from "@/features/auth/services/oauth";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await signInWithGoogle();

  if (!result.success || !result.redirectUrl) {
    return NextResponse.json(
      { error: result.message ?? "Failed to initiate OAuth" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(result.redirectUrl);
}
