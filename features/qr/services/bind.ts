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
 * - No SELECT is performed (prevents data leakage)
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

    // Atomic UPDATE:
    // - Succeeds only if QR is unbound
    // - RLS enforces bound_by_user_id = auth.uid()
    const { data, error } = await (supabase as any)
      .from("qr_codes")
      .update({
        bound_by_user_id: user.id,
        bound_at: new Date().toISOString(),
      })
      .eq("code", normalizedCode)
      .is("bound_by_user_id", null);

    if (error) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    // If no rows were updated → QR already bound or does not exist
    if (!data || data.length === 0) {
      return { success: false, error: "ALREADY_BOUND" };
    }

    // Success is inferred purely from UPDATE result
    return { success: true };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
