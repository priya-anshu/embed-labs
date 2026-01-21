/**
 * Admin kit services.
 *
 * SECURITY-FIRST:
 * - Uses service role (bypasses RLS)
 * - Validates inputs
 * - Soft disable only (no deletes)
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface CreateKitInput {
  name: string;
  description?: string | null;
}

export interface KitResult {
  success: boolean;
  id?: string;
  error?: "INVALID_INPUT" | "NOT_FOUND" | "UNKNOWN_ERROR";
}

export async function createKit(input: CreateKitInput): Promise<KitResult> {
  if (!input.name.trim()) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { data, error } = await adminSupabase
      .from("kits")
      .insert({
        name: input.name.trim(),
        description: input.description ?? null,
        is_active: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    return { success: true, id: data.id };
  } catch (err) {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

export async function disableKit(kitId: string): Promise<KitResult> {
  if (!kitId) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { data, error } = await adminSupabase
      .from("kits")
      .update({ is_active: false })
      .eq("id", kitId)
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: "NOT_FOUND" };
    }

    return { success: true, id: data.id };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

export interface AddKitItemInput {
  kitId: string;
  contentType: string;
  contentId: string;
}

export async function addKitItem(
  input: AddKitItemInput
): Promise<KitResult> {
  if (!input.kitId || !input.contentType.trim() || !input.contentId) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { data, error } = await adminSupabase
      .from("kit_items")
      .insert({
        kit_id: input.kitId,
        content_type: input.contentType.trim(),
        content_id: input.contentId,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    return { success: true, id: data.id };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

export interface GrantKitInput {
  qrId: string;
  kitId: string;
  adminId?: string | null;
}

export async function grantKitToQR(
  input: GrantKitInput
): Promise<KitResult> {
  if (!input.qrId || !input.kitId) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;

    // Optional validations: ensure QR is active and kit is active
    const { data: qrData, error: qrError } = await adminSupabase
      .from("qr_codes")
      .select("id, is_active, bound_by_user_id")
      .eq("id", input.qrId)
      .single();

    if (qrError || !qrData || !qrData.is_active || !qrData.bound_by_user_id) {
      return { success: false, error: "INVALID_INPUT" };
    }

    const { data: kitData, error: kitError } = await adminSupabase
      .from("kits")
      .select("id, is_active")
      .eq("id", input.kitId)
      .single();

    if (kitError || !kitData || !kitData.is_active) {
      return { success: false, error: "INVALID_INPUT" };
    }

    const { data, error } = await adminSupabase
      .from("qr_kit_grants")
      .insert({
        qr_id: input.qrId,
        kit_id: input.kitId,
        granted_by_admin_id: input.adminId ?? null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    return { success: true, id: data.id };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

export interface RevokeKitGrantInput {
  grantId?: string;
  qrId?: string;
  kitId?: string;
  adminId?: string | null;
}

export async function revokeKitGrant(
  input: RevokeKitGrantInput
): Promise<KitResult> {
  if (!input.grantId && !(input.qrId && input.kitId)) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;

    const query = adminSupabase
      .from("qr_kit_grants")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by_admin_id: input.adminId ?? null,
      })
      .is("revoked_at", null);

    if (input.grantId) {
      query.eq("id", input.grantId);
    } else {
      query.eq("qr_id", input.qrId!).eq("kit_id", input.kitId!);
    }

    const { data, error } = await query.select("id").single();

    if (error || !data) {
      return { success: false, error: "NOT_FOUND" };
    }

    return { success: true, id: data.id };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
