/**
 * QR verification operation - ownership check only.
 *
 * SECURITY-FIRST:
 * - Server-gated read
 * - No QR enumeration
 * - No availability probing
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth";
import type { VerifyQRResult } from "../types";
import { validateQRCodeFormat, normalizeQRCode } from "./validation";
import { mapDatabaseRowToQRCode } from "./mappers";

export async function verifyQRBinding(
  code: string
): Promise<VerifyQRResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      belongsToUser: false,
      isBound: false,
      error: "UNAUTHORIZED",
    };
  }

  const normalizedCode = normalizeQRCode(code);

  if (!validateQRCodeFormat(normalizedCode)) {
    return {
      belongsToUser: false,
      isBound: false,
      error: "NOT_FOUND",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await (supabase)
      .from("qr_codes")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (error || !data) {
      return {
        belongsToUser: false,
        isBound: false,
        error: "NOT_FOUND",
      };
    }

    const qrCode = mapDatabaseRowToQRCode(data);

    return {
      belongsToUser: true,
      isBound: true,
      qrCode,
    };
  } catch {
    return {
      belongsToUser: false,
      isBound: false,
      error: "UNKNOWN_ERROR",
    };
  }
}
