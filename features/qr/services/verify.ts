/**
 * QR verification operation - Check ownership and binding status.
 * 
 * SECURITY: Server-gated read operation.
 * - Uses auth.uid() from Supabase session
 * - RLS policy restricts what users can read
 * - Returns ownership status without exposing sensitive data
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth";
import type { VerifyQRResult } from "../types";
import { validateQRCodeFormat, normalizeQRCode } from "./validation";
import { mapDatabaseRowToQRCode } from "./mappers";

/**
 * Verify QR code ownership and binding status.
 * 
 * SECURITY: Server-gated read operation.
 * Returns ownership status without exposing sensitive data.
 */
export async function verifyQRBinding(
  code: string
): Promise<VerifyQRResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      belongsToUser: false,
      isBound: false,
      isAvailable: false,
      error: "UNAUTHORIZED",
    };
  }

  const normalizedCode = normalizeQRCode(code);
  if (!validateQRCodeFormat(normalizedCode)) {
    return {
      belongsToUser: false,
      isBound: false,
      isAvailable: false,
      error: "NOT_FOUND",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Server-gated read (RLS policy restricts access)
    // Note: With restrictive SELECT policy, users can only read QRs they own
    // Unbound QRs are not visible, but binding success is inferred from UPDATE result
    // 
    // TEMPORARY: Type assertion until Supabase types are generated after migration
    // After running: npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
    // Remove this assertion and the code will be fully typed
    const { data, error } = await (supabase as any)
      .from("qr_codes")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (error || !data) {
      return {
        belongsToUser: false,
        isBound: false,
        isAvailable: false,
        error: "NOT_FOUND",
      };
    }

    const qrCode = mapDatabaseRowToQRCode(data);
    const isBound = qrCode.boundByUserId !== null;
    const belongsToUser = qrCode.boundByUserId === user.id;

    return {
      belongsToUser,
      isBound,
      isAvailable: !isBound,
      qrCode,
    };
  } catch (error) {
    return {
      belongsToUser: false,
      isBound: false,
      isAvailable: false,
      error: "UNKNOWN_ERROR",
    };
  }
}
