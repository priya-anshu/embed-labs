/**
 * Read-only QR data fetching services.
 * 
 * SECURITY-FIRST:
 * - User services use regular client (RLS enforced)
 * - Admin services use service role (bypasses RLS)
 * - SELECT queries only (no mutations)
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getCurrentUser } from "@/features/auth";
import { mapDatabaseRowToQRCode, mapDatabaseRowToQREvent } from "./mappers";
import type { QRCode, QREvent } from "../types";

/**
 * Get the current user's QR code (if bound).
 * 
 * SECURITY: Uses regular client, RLS ensures user can only
 * read their own bound QR.
 */
export async function getUserQR(): Promise<QRCode | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("bound_by_user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDatabaseRowToQRCode(data);
  } catch {
    return null;
  }
}

/**
 * Get QR events for the current user.
 * 
 * SECURITY: Uses regular client, RLS ensures user can only
 * read events where they are the affected user.
 */
export async function getUserQREvents(): Promise<QREvent[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("qr_events")
      .select("*")
      .eq("affected_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDatabaseRowToQREvent);
  } catch {
    return [];
  }
}

/**
 * Get all QR codes (admin only).
 * 
 * SECURITY: Uses service role to bypass RLS.
 * Only call this from admin pages with role verification.
 */
export async function getAllQRs(): Promise<QRCode[]> {
  try {
    const adminSupabase = createServiceRoleClient();

    const { data, error } = await adminSupabase
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDatabaseRowToQRCode);
  } catch {
    return [];
  }
}

/**
 * Get all QR events (admin only).
 * 
 * SECURITY: Uses service role to bypass RLS.
 * Only call this from admin pages with role verification.
 */
export async function getAllQREvents(): Promise<QREvent[]> {
  try {
    const adminSupabase = createServiceRoleClient();

    const { data, error } = await adminSupabase
      .from("qr_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDatabaseRowToQREvent);
  } catch {
    return [];
  }
}
