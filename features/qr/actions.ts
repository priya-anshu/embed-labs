/**
 * QR binding Server Actions.
 * 
 * These actions can be called from Client Components
 * and handle QR binding operations server-side.
 * 
 * SECURITY: All operations use auth.uid() from Supabase session.
 * Never trust client-provided user IDs or QR codes.
 * 
 * Usage:
 *   import { bindQRAction, verifyQRAction, mintTokenAction } from "@/features/qr/actions";
 */

"use server";

import { attemptBindQR } from "./services/bind";
import { verifyQRBinding } from "./services/verify";
import { mintAccessToken } from "./services/tokens";
import type { BindQRResult, VerifyQRResult } from "./types";
import type { MintTokenResult } from "./services/tokens";

/**
 * Server Action: Attempt to bind a QR code to the current user.
 * 
 * SECURITY: Binding is UPDATE-ONLY and PERMANENT.
 * - QR code must be UUID v4 format
 * - QR must exist and be unbound
 * - Binding is atomic and irreversible
 * 
 * @param code - QR code string (UUID v4 format)
 * @returns BindQRResult with success status
 */
export async function bindQRAction(
  code: string
): Promise<BindQRResult> {
  return attemptBindQR(code);
}

/**
 * Server Action: Verify QR code ownership and binding status.
 * 
 * SECURITY: Server-gated read operation.
 * - Returns ownership status without exposing sensitive data
 * - RLS policies restrict what users can read
 * 
 * @param code - QR code string (UUID v4 format)
 * @returns VerifyQRResult with ownership and binding status
 */
export async function verifyQRAction(
  code: string
): Promise<VerifyQRResult> {
  return verifyQRBinding(code);
}

/**
 * Server Action: Mint a single-use access token for the current user.
 * 
 * SECURITY: Server-side validation only.
 * - User must be authenticated
 * - User must own an ACTIVE QR
 * - QR must have at least one ACTIVE kit grant
 * - Returns RAW token once (never stored)
 * 
 * @returns MintTokenResult with raw token and expiry
 */
export async function mintTokenAction(): Promise<MintTokenResult> {
  return mintAccessToken();
}

/**
 * Server Action: Mint a single-use access token for a specific kit.
 * 
 * SECURITY: Server-side validation only.
 * - User must be authenticated
 * - User must own an ACTIVE QR
 * - QR must have an ACTIVE grant for the specified kit
 * - Returns RAW token once (never stored)
 * 
 * @param kitId - Kit ID to mint token for
 * @returns MintTokenResult with raw token and expiry
 */
export async function mintTokenForKitAction(kitId: string): Promise<MintTokenResult> {
  const { mintAccessTokenForKit } = await import("./services/tokens");
  return mintAccessTokenForKit(kitId);
}
