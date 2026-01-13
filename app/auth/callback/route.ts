/**
 * OAuth callback handler.
 * 
 * Handles OAuth redirects from providers (Google, etc.)
 * and processes the authentication callback.
 * 
 * This route is called by the OAuth provider after user
 * authentication. It exchanges the code for a session.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(error)}`, requestUrl.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/error?error=missing_code", requestUrl.origin)
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent(exchangeError.message)}`,
        requestUrl.origin
      )
    );
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
