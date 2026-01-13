/**
 * QR binding type definitions.
 * 
 * Security-first types for irreversible access control.
 * QR codes are treated as controlled assets, not user input.
 */

/**
 * QR code record structure.
 * 
 * ASSUMPTION: Table `qr_codes` exists with these columns:
 * - id: UUID (primary key)
 * - code: TEXT UNIQUE (UUID v4 format, admin-generated only)
 * - created_at: TIMESTAMPTZ
 * - bound_at: TIMESTAMPTZ | NULL
 * - bound_by_user_id: UUID | NULL (references auth.users)
 * - metadata: JSONB | NULL (restricted to non-sensitive data)
 */
export interface QRCode {
  id: string;
  code: string; // UUID v4 format, non-guessable
  createdAt: Date;
  boundAt: Date | null; // NULL = unbound, NOT NULL = permanently bound
  boundByUserId: string | null; // NULL = unbound, NOT NULL = immutable ownership
  metadata: QRMetadata | null; // Restricted to non-sensitive data only
}

/**
 * QR metadata structure - RESTRICTED to non-sensitive data only.
 * 
 * ALLOWED: course_id, batch_id, issued_by_admin_id
 * FORBIDDEN: PII, emails, user identifiers, secrets
 */
export interface QRMetadata {
  course_id?: string;
  batch_id?: string;
  issued_by_admin_id?: string;
  // Add other non-sensitive fields as needed
  // NEVER include: email, name, phone, password, token, secret
}

/**
 * Result of attempting to bind a QR code.
 * 
 * Binding is UPDATE-ONLY and PERMANENT.
 * Once bound, ownership cannot change.
 */
export interface BindQRResult {
  success: boolean;
  error?:
    | "ALREADY_BOUND" // QR already bound to another user
    | "INVALID_CODE" // Code format invalid (not UUID v4)
    | "NOT_FOUND" // QR code doesn't exist
    | "UNAUTHORIZED" // User not authenticated
    | "UNKNOWN_ERROR"; // Unexpected error
  qrCode?: QRCode; // Only present if success = true
}

/**
 * Result of verifying QR code ownership.
 * 
 * Used to check if a QR belongs to the current user
 * or if it's available for binding.
 */
export interface VerifyQRResult {
  belongsToUser: boolean; // True if bound to current user
  isBound: boolean; // True if bound to any user
  isAvailable: boolean; // True if unbound (available for binding)
  qrCode?: QRCode; // QR code data if found
  error?: "NOT_FOUND" | "UNAUTHORIZED" | "UNKNOWN_ERROR";
}
