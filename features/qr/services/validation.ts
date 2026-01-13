/**
 * QR code validation service.
 * 
 * Validates QR code format and structure.
 * Security: QR codes MUST be UUID v4 format only.
 */

/**
 * UUID v4 regex pattern.
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Where x is any hexadecimal digit and y is one of 8, 9, A, or B
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate QR code format.
 * 
 * SECURITY: QR codes MUST be UUID v4 format only.
 * This ensures they are non-guessable and non-derivable.
 * 
 * @param code - QR code string to validate
 * @returns true if valid UUID v4 format, false otherwise
 */
export function validateQRCodeFormat(code: string): boolean {
  if (!code || typeof code !== "string") {
    return false;
  }

  return UUID_V4_REGEX.test(code.trim());
}

/**
 * Normalize QR code string.
 * 
 * Trims whitespace and converts to lowercase for consistency.
 * Does NOT validate format - use validateQRCodeFormat() for that.
 */
export function normalizeQRCode(code: string): string {
  return code.trim().toLowerCase();
}
