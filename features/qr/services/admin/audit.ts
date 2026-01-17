/**
 * Audit logging service for QR events.
 * 
 * SECURITY: Uses service role to bypass RLS and ensure
 * append-only audit logging. All admin operations must
 * log events via this service.
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Json } from "@/lib/supabase/types";

export type QREventAction = "GENERATED" | "BOUND" | "REVOKED" | "REASSIGNED";

export interface QREventData {
  qrId: string;
  adminId?: string | null; // NULL for user-driven events (BOUND)
  affectedUserId: string | null;
  action: QREventAction;
  details?: Json | null;
}

/**
 * Log a QR event to the audit log.
 * 
 * SECURITY: Uses service role to ensure event is always logged,
 * even if RLS would normally prevent it.
 * 
 * This is append-only - events cannot be modified or deleted.
 */
export async function logQREvent(data: QREventData): Promise<void> {
  const adminSupabase = createServiceRoleClient();

  const { error } = await adminSupabase.from("qr_events").insert({
    qr_id: data.qrId,
    admin_id: data.adminId ?? null,
    affected_user_id: data.affectedUserId,
    action: data.action,
    details: data.details ?? null,
  });

  if (error) {
    // Logging failures are critical - throw to prevent silent failures
    throw new Error(`Failed to log QR event: ${error.message}`);
  }
}
