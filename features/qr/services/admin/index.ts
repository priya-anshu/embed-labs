/**
 * Admin QR services public API.
 * 
 * SECURITY: All operations use service role and bypass RLS.
 * These services are server-side only and admin-only.
 */

export type { RevokeQRResult, ReassignQRResult, ReassignQROptions } from "./types";
export { revokeQR } from "./revoke";
export { reassignQR } from "./reassign";
export { logQREvent, type QREventAction, type QREventData } from "./audit";
