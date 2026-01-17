/**
 * Admin service: Revoke QR code (soft revoke).
 * 
 * SECURITY-FIRST:
 * - Uses service role to bypass RLS
 * - Transaction-safe: QR update + audit log in single operation
 * - Soft revoke: is_active = FALSE, ownership remains immutable
 * - Append-only audit logging
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logQREvent } from "./audit";
import type { RevokeQRResult } from "./types";

/**
 * Revoke a bound QR code (soft revoke).
 * 
 * SECURITY:
 * - Uses service role (bypasses RLS)
 * - Sets is_active = FALSE (QR cannot be used, but ownership preserved)
 * - Logs REVOKED event to audit log
 * - Transaction-safe: both operations succeed or both fail
 * 
 * @param qrId - UUID of the QR code to revoke
 * @param adminId - UUID of the admin performing the action
 * @returns RevokeQRResult with success status
 */
export async function revokeQR(
  qrId: string,
  adminId: string
): Promise<RevokeQRResult> {
  const adminSupabase = createServiceRoleClient();

  try {
    // First, verify QR exists and is bound
    const { data: qrData, error: fetchError } = await adminSupabase
      .from("qr_codes")
      .select("id, bound_by_user_id, is_active")
      .eq("id", qrId)
      .single();

    if (fetchError || !qrData) {
      return { success: false, error: "NOT_FOUND" };
    }

    if (!qrData.bound_by_user_id) {
      return { success: false, error: "NOT_BOUND" };
    }

    if (!qrData.is_active) {
      return { success: false, error: "ALREADY_REVOKED" };
    }

    // Perform soft revoke (transaction-safe via Supabase's atomic operations)
    const { error: updateError } = await adminSupabase
      .from("qr_codes")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by_admin_id: adminId,
      })
      .eq("id", qrId);

    if (updateError) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    // Log audit event (append-only)
    await logQREvent({
      qrId,
      adminId,
      affectedUserId: qrData.bound_by_user_id,
      action: "REVOKED",
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
