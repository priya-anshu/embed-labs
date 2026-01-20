/**
 * QR code data mapping utilities.
 * 
 * Maps database rows to TypeScript types.
 * Assumes database structure matches QRCode interface.
 */

import type { QRCode, QREvent } from "../types";

/**
 * Map database row to QRCode type.
 * 
 * ASSUMPTION: Database row structure matches QRCode interface.
 * Column names use snake_case (created_at, bound_at, etc.)
 */
export function mapDatabaseRowToQRCode(row: any): QRCode {
  return {
    id: row.id,
    code: row.code,
    createdAt: new Date(row.created_at),
    boundAt: row.bound_at ? new Date(row.bound_at) : null,
    boundByUserId: row.bound_by_user_id,
    metadata: row.metadata,
    isActive: row.is_active ?? true,
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    revokedByAdminId: row.revoked_by_admin_id ?? null,
  };
}

/**
 * Map database row to QREvent type.
 */
export function mapDatabaseRowToQREvent(row: any): QREvent {
  return {
    id: row.id,
    qrId: row.qr_id,
    adminId: row.admin_id ?? null,
    affectedUserId: row.affected_user_id ?? null,
    action: row.action,
    details: row.details ?? null,
    createdAt: new Date(row.created_at),
  };
}
