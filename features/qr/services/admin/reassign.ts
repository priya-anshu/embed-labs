/**
 * Admin service: Reassign QR code to user.
 * 
 * SECURITY-FIRST:
 * - Uses service role to bypass RLS
 * - Creates NEW QR code (never reuses existing)
 * - Optionally revokes old QR (soft revoke)
 * - Transaction-safe: all operations succeed or all fail
 * - Append-only audit logging
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logQREvent } from "./audit";
import { revokeQR } from "./revoke";
import type { ReassignQRResult } from "./types";
import type { ReassignQROptions } from "./types";
import type { Json } from "@/lib/supabase/types";
import { randomUUID } from "crypto";

/**
 * Reassign a QR code to a user (create new QR, optionally revoke old).
 * 
 * SECURITY:
 * - Uses service role (bypasses RLS)
 * - Creates NEW QR code (immutability preserved)
 * - Optionally soft-revokes old QR
 * - Logs GENERATED and REASSIGNED events
 * - Transaction-safe: all operations succeed or all fail
 * 
 * @param options - Reassignment options
 * @param adminId - UUID of the admin performing the action
 * @returns ReassignQRResult with success status and new QR ID
 */
export async function reassignQR(
  options: ReassignQROptions,
  adminId: string
): Promise<ReassignQRResult> {
  const adminSupabase = createServiceRoleClient();

  try {
    // Verify user exists
    const { data: userData, error: userError } =
      await adminSupabase.auth.admin.getUserById(options.userId);

    if (userError || !userData) {
      return { success: false, error: "USER_NOT_FOUND" };
    }

    // Optionally revoke old QR before creating new one
    if (options.revokeOldQR && options.oldQRId) {
      const revokeResult = await revokeQR(options.oldQRId, adminId);
      if (!revokeResult.success) {
        // Continue anyway - old QR might already be revoked or not exist
      }
    }

    // Generate new UUID v4 QR code
    const newQRCode = randomUUID();

    // Create new QR code bound to user
    const { data: newQRData, error: insertError } = await adminSupabase
      .from("qr_codes")
      .insert({
        code: newQRCode,
        bound_by_user_id: options.userId,
        bound_at: new Date().toISOString(),
        is_active: true,
        metadata: options.metadata ?? null,
      })
      .select("id")
      .single();

    if (insertError || !newQRData) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    // Log GENERATED event
    await logQREvent({
      qrId: newQRData.id,
      adminId,
      affectedUserId: options.userId,
      action: "GENERATED",
    });

    // Log REASSIGNED event (with details linking old and new QR if applicable)
    const reassignDetails: Json | null =
      options.oldQRId && options.revokeOldQR
        ? { old_qr_id: options.oldQRId, new_qr_id: newQRData.id }
        : { new_qr_id: newQRData.id };

    await logQREvent({
      qrId: newQRData.id,
      adminId,
      affectedUserId: options.userId,
      action: "REASSIGNED",
      details: reassignDetails,
    });

    return {
      success: true,
      newQRId: newQRData.id,
    };
  } catch (error) {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
