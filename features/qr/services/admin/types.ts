/**
 * Admin service type definitions.
 * 
 * Types for admin-only QR operations (revoke, reassign).
 */

import type { Json } from "@/lib/supabase/types";

export interface RevokeQRResult {
  success: boolean;
  error?:
    | "NOT_FOUND" // QR code doesn't exist
    | "ALREADY_REVOKED" // QR is already revoked
    | "NOT_BOUND" // QR is not bound to any user
    | "UNAUTHORIZED" // Admin not authenticated
    | "UNKNOWN_ERROR";
}

export interface ReassignQRResult {
  success: boolean;
  newQRId?: string; // ID of the newly created QR
  error?:
    | "USER_NOT_FOUND" // Target user doesn't exist
    | "INVALID_METADATA" // Metadata validation failed
    | "UNAUTHORIZED" // Admin not authenticated
    | "UNKNOWN_ERROR";
}

export interface ReassignQROptions {
  userId: string; // User to receive new QR
  metadata?: Json; // Optional metadata for new QR
  revokeOldQR?: boolean; // Whether to revoke user's existing active QR
  oldQRId?: string; // Specific QR to revoke (if revokeOldQR is true)
}
