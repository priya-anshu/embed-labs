/**
 * QR code data mapping utilities.
 * 
 * Maps database rows to TypeScript types.
 * Assumes database structure matches QRCode interface.
 */

import type { QRCode, QREvent, Kit, KitItem, QRKitGrant } from "../types";
import type { PlaylistRecord, PlaylistItemRecord } from "./admin/playlists";

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

/**
 * Map database row to Kit type.
 */
export function mapDatabaseRowToKit(row: any): Kit {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    isActive: row.is_active ?? true,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Map database row to KitItem type.
 */
export function mapDatabaseRowToKitItem(row: any): KitItem {
  return {
    id: row.id,
    kitId: row.kit_id,
    contentType: row.content_type,
    contentId: row.content_id,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Map database row to QRKitGrant type.
 */
export function mapDatabaseRowToQRKitGrant(row: any): QRKitGrant {
  return {
    id: row.id,
    qrId: row.qr_id,
    kitId: row.kit_id,
    grantedByAdminId: row.granted_by_admin_id ?? null,
    grantedAt: new Date(row.granted_at),
    revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    revokedByAdminId: row.revoked_by_admin_id ?? null,
  };
}

/**
 * Map database row to PlaylistRecord type.
 */
export function mapDatabaseRowToPlaylist(row: any): PlaylistRecord {
  return {
    id: row.id,
    kitId: row.kit_id,
    name: row.name,
    description: row.description ?? null,
    sortIndex: row.sort_index,
    createdAt: new Date(row.created_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  };
}

/**
 * Map database row to PlaylistItemRecord type.
 */
export function mapDatabaseRowToPlaylistItem(row: any): PlaylistItemRecord {
  return {
    id: row.id,
    playlistId: row.playlist_id,
    contentId: row.content_id,
    sortIndex: row.sort_index,
    createdAt: new Date(row.created_at),
  };
}
