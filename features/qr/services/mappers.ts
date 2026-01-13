/**
 * QR code data mapping utilities.
 * 
 * Maps database rows to TypeScript types.
 * Assumes database structure matches QRCode interface.
 */

import type { QRCode } from "../types";

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
  };
}
