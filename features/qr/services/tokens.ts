/**
 * Token services (server-side only).
 *
 * SECURITY-FIRST:
 * - Uses service role (never exposed to client)
 * - Tokens are single-use and hashed before storage
 * - QR must be active; kit grant must be active
 * - No token reuse
 */

import { randomBytes, createHash } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getCurrentUser } from "@/features/auth";

export interface MintTokenResult {
  success: boolean;
  token?: string; // RAW token, returned once
  expiresAt?: Date;
  error?:
    | "UNAUTHORIZED"
    | "NO_ACTIVE_QR"
    | "NO_ACTIVE_GRANT"
    | "SERVICE_CONFIGURATION_ERROR"
    | "UNKNOWN_ERROR";
}

export interface ConsumeTokenResult {
  success: boolean;
  error?:
    | "INVALID_TOKEN"
    | "EXPIRED"
    | "REVOKED"
    | "USED"
    | "QR_INACTIVE"
    | "GRANT_REVOKED"
    | "SERVICE_CONFIGURATION_ERROR"
    | "UNKNOWN_ERROR";
}

// Default TTL: 10 minutes
const DEFAULT_TOKEN_TTL_MS = 10 * 60 * 1000;

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Mint a single-use access token for the current user.
 * Requirements:
 * - User must be authenticated
 * - User must own an ACTIVE QR (is_active = true)
 * - QR must have at least one ACTIVE kit grant
 * Returns RAW token once; only the hash is stored.
 */
export async function mintAccessToken(): Promise<MintTokenResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  const adminSupabase = createServiceRoleClient() as any;

  try {
    // Find an active QR for this user
    const { data: qrData, error: qrError } = await adminSupabase
      .from("qr_codes")
      .select("id")
      .eq("bound_by_user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (qrError || !qrData) {
      return { success: false, error: "NO_ACTIVE_QR" };
    }

    // Find an active kit grant for this QR
    const { data: grantData, error: grantError } = await adminSupabase
      .from("qr_kit_grants")
      .select("kit_id")
      .eq("qr_id", qrData.id)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();

    if (grantError || !grantData) {
      return { success: false, error: "NO_ACTIVE_GRANT" };
    }

    // Generate raw token and hash
    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + DEFAULT_TOKEN_TTL_MS);

    const { error: insertError } = await adminSupabase
      .from("access_tokens")
      .insert({
        token_hash: tokenHash,
        qr_id: qrData.id,
        user_id: user.id,
        kit_id: grantData.kit_id,
        expires_at: expiresAt.toISOString(),
        purpose: "CONTENT_SESSION",
      });

    if (insertError) {
      if (
        insertError.message.includes("SUPABASE_SERVICE_ROLE_KEY") ||
        insertError.message.includes("service role")
      ) {
        return { success: false, error: "SERVICE_CONFIGURATION_ERROR" };
      }
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    return { success: true, token: rawToken, expiresAt };
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return { success: false, error: "SERVICE_CONFIGURATION_ERROR" };
    }
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

/**
 * Mint a single-use access token for a specific kit.
 * Requirements:
 * - User must be authenticated
 * - User must own an ACTIVE QR (is_active = true)
 * - QR must have an ACTIVE grant for the specified kit
 * Returns RAW token once; only the hash is stored.
 */
export async function mintAccessTokenForKit(kitId: string): Promise<MintTokenResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  const adminSupabase = createServiceRoleClient() as any;

  try {
    // Find an active QR for this user
    const { data: qrData, error: qrError } = await adminSupabase
      .from("qr_codes")
      .select("id")
      .eq("bound_by_user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (qrError || !qrData) {
      return { success: false, error: "NO_ACTIVE_QR" };
    }

    // Verify user has active grant for this specific kit
    const { data: grantData, error: grantError } = await adminSupabase
      .from("qr_kit_grants")
      .select("kit_id")
      .eq("qr_id", qrData.id)
      .eq("kit_id", kitId)
      .is("revoked_at", null)
      .maybeSingle();

    if (grantError || !grantData) {
      return { success: false, error: "NO_ACTIVE_GRANT" };
    }

    // Generate raw token and hash
    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + DEFAULT_TOKEN_TTL_MS);

    const { error: insertError } = await adminSupabase
      .from("access_tokens")
      .insert({
        token_hash: tokenHash,
        qr_id: qrData.id,
        user_id: user.id,
        kit_id: kitId,
        expires_at: expiresAt.toISOString(),
        purpose: "CONTENT_SESSION",
      });

    if (insertError) {
      if (
        insertError.message.includes("SUPABASE_SERVICE_ROLE_KEY") ||
        insertError.message.includes("service role")
      ) {
        return { success: false, error: "SERVICE_CONFIGURATION_ERROR" };
      }
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    return { success: true, token: rawToken, expiresAt };
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return { success: false, error: "SERVICE_CONFIGURATION_ERROR" };
    }
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

/**
 * Consume a token atomically.
 * Uses RPC consume_access_token to enforce:
 * - single use (used_at IS NULL)
 * - not revoked
 * - not expired
 * - QR active
 * - grant active
 */
export async function consumeAccessToken(
  rawToken: string
): Promise<ConsumeTokenResult> {
  if (!rawToken || typeof rawToken !== "string") {
    return { success: false, error: "INVALID_TOKEN" };
  }

  const adminSupabase = createServiceRoleClient() as any;
  const tokenHash = hashToken(rawToken);

  try {
    const { data, error } = await adminSupabase.rpc(
      "consume_access_token",
      { p_token_hash: tokenHash }
    );

    if (error) {
      if (
        error.message.includes("SUPABASE_SERVICE_ROLE_KEY") ||
        error.message.includes("service role")
      ) {
        return { success: false, error: "SERVICE_CONFIGURATION_ERROR" };
      }
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    if (!data) {
      // No row updated -> invalid, expired, revoked, or already used
      return { success: false, error: "INVALID_TOKEN" };
    }

    return { success: true };
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return { success: false, error: "SERVICE_CONFIGURATION_ERROR" };
    }
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
