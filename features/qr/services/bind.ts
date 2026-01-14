/**
 * QR binding operation - Atomic, permanent binding.
 *
 * SECURITY-FIRST:
 * - UPDATE-ONLY (no INSERT, no DELETE)
 * - Users can bind ONLY unbound QRs
 * - Ownership is permanent and immutable
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth";
import type { BindQRResult } from "../types";
import { validateQRCodeFormat, normalizeQRCode } from "./validation";

/**
 * Attempt to bind a QR code to the current authenticated user.
 *
 * SECURITY:
 * - Uses auth.uid() from Supabase session
 * - Atomic UPDATE prevents race conditions
 * - No sensitive data is returned
 */
export async function attemptBindQR(
  code: string
): Promise<BindQRResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  const normalizedCode = normalizeQRCode(code);

  if (!validateQRCodeFormat(normalizedCode)) {
    return { success: false, error: "INVALID_CODE" };
  }

  try {
    const supabase = await createServerSupabaseClient();

    /**
     * IMPORTANT:
     * Supabase UPDATE returns `never` unless `.select()` is used.
     * We select ONLY the primary key to detect affected rows.
     */
    const { data, error } = await supabase
      .from("qr_codes")
      .update({
        bound_by_user_id: user.id,
        bound_at: new Date().toISOString(),
      })
      .eq("code", normalizedCode)
      .is("bound_by_user_id", null)
      .select("id"); // ✅ minimal, safe, no data leak

    if (error) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    // No rows affected → already bound or not found
    if (!data || data.length === 0) {
      return { success: false, error: "ALREADY_BOUND" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
