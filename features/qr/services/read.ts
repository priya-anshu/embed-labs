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
import {
  mapDatabaseRowToQRCode,
  mapDatabaseRowToQREvent,
  mapDatabaseRowToKit,
  mapDatabaseRowToKitItem,
  mapDatabaseRowToQRKitGrant,
  mapDatabaseRowToPlaylist,
  mapDatabaseRowToPlaylistItem,
} from "./mappers";
import type { QRCode, QREvent, Kit, KitItem, QRKitGrant } from "../types";
import type { PlaylistRecord, PlaylistItemRecord } from "./admin/playlists";

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

/**
 * Get all kits (admin only).
 * 
 * SECURITY: Uses service role to bypass RLS.
 * Only call this from admin pages with role verification.
 */
export async function getAllKits(): Promise<Kit[]> {
  try {
    const adminSupabase = createServiceRoleClient() as any;

    const { data, error } = await adminSupabase
      .from("kits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDatabaseRowToKit);
  } catch {
    return [];
  }
}

/**
 * Get kit by ID (admin only).
 * 
 * SECURITY: Uses service role to bypass RLS.
 * Only call this from admin pages with role verification.
 */
export async function getKitById(kitId: string): Promise<Kit | null> {
  try {
    const adminSupabase = createServiceRoleClient() as any;

    const { data, error } = await adminSupabase
      .from("kits")
      .select("*")
      .eq("id", kitId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDatabaseRowToKit(data);
  } catch {
    return null;
  }
}

/**
 * Get kit items for a kit (admin only).
 * 
 * SECURITY: Uses service role to bypass RLS.
 * Only call this from admin pages with role verification.
 */
export async function getKitItems(kitId: string): Promise<KitItem[]> {
  try {
    const adminSupabase = createServiceRoleClient() as any;

    const { data, error } = await adminSupabase
      .from("kit_items")
      .select("*")
      .eq("kit_id", kitId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDatabaseRowToKitItem);
  } catch {
    return [];
  }
}

/**
 * Get QR kit grants for a QR (admin only).
 * 
 * SECURITY: Uses service role to bypass RLS.
 * Only call this from admin pages with role verification.
 */
export async function getQRKitGrants(qrId: string): Promise<QRKitGrant[]> {
  try {
    const adminSupabase = createServiceRoleClient() as any;

    const { data, error } = await adminSupabase
      .from("qr_kit_grants")
      .select("*")
      .eq("qr_id", qrId)
      .order("granted_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDatabaseRowToQRKitGrant);
  } catch {
    return [];
  }
}

/**
 * Get QR kit grants for a kit (admin only).
 * 
 * SECURITY: Uses service role to bypass RLS.
 * Only call this from admin pages with role verification.
 */
export async function getKitGrants(kitId: string): Promise<QRKitGrant[]> {
  try {
    const adminSupabase = createServiceRoleClient() as any;

    const { data, error } = await adminSupabase
      .from("qr_kit_grants")
      .select("*")
      .eq("kit_id", kitId)
      .order("granted_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDatabaseRowToQRKitGrant);
  } catch {
    return [];
  }
}

/**
 * Get kits granted to the current user's QR (user-facing).
 * 
 * SECURITY: Uses regular client, RLS ensures user can only
 * read grants for their own QR.
 */
export async function getUserKits(): Promise<Kit[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Find user's active QR
    const { data: qrData, error: qrError } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("bound_by_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (qrError || !qrData) {
      return [];
    }

    // Find active grants for this QR
    // Note: Using type assertion until Supabase types are regenerated
    const { data: grantsData, error: grantsError } = await (supabase as any)
      .from("qr_kit_grants")
      .select("kit_id")
      .eq("qr_id", qrData.id)
      .is("revoked_at", null);

    if (grantsError || !grantsData || grantsData.length === 0) {
      return [];
    }

    const kitIds = grantsData.map((g: { kit_id: string }) => g.kit_id);

    // Fetch kit details (using service role since kits table has no user RLS)
    // Note: This is safe because we're only fetching kits that are already
    // granted to the user's QR, and we're not exposing sensitive data.
    const adminSupabase = createServiceRoleClient() as any;
    const { data: kitsData, error: kitsError } = await adminSupabase
      .from("kits")
      .select("*")
      .in("id", kitIds)
      .eq("is_active", true);

    if (kitsError || !kitsData) {
      return [];
    }

    return kitsData.map(mapDatabaseRowToKit);
  } catch {
    return [];
  }
}

/**
 * Get playlists for a kit (user-facing, read-only).
 *
 * SECURITY: Validates user has active QR with active kit grant.
 * Only returns playlists if user already has kit access.
 * Does NOT use playlists for access control.
 */
export async function getUserKitPlaylists(kitId: string): Promise<PlaylistRecord[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Step 1: Find user's active QR
    const { data: qrData, error: qrError } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("bound_by_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (qrError || !qrData) {
      return [];
    }

    // Step 2: Verify user has active grant for this kit
    const { data: grantData, error: grantError } = await (supabase as any)
      .from("qr_kit_grants")
      .select("kit_id")
      .eq("qr_id", qrData.id)
      .eq("kit_id", kitId)
      .is("revoked_at", null)
      .maybeSingle();

    if (grantError || !grantData) {
      return [];
    }

    // Step 3: User has access - fetch playlists (using service role for playlists table)
    // This is safe because we've already validated kit access via grants
    const adminSupabase = createServiceRoleClient() as any;
    const { data: playlistsData, error: playlistsError } = await adminSupabase
      .from("playlists")
      .select("id, kit_id, name, description, sort_index, created_at, deleted_at")
      .eq("kit_id", kitId)
      .is("deleted_at", null)
      .order("sort_index", { ascending: true });

    if (playlistsError || !playlistsData) {
      return [];
    }

    return playlistsData.map(mapDatabaseRowToPlaylist);
  } catch {
    return [];
  }
}

/**
 * Get playlist items for a playlist (user-facing, read-only).
 *
 * SECURITY: Validates user has active QR with active kit grant for the playlist's kit.
 * Only returns items if user already has kit access.
 * Does NOT use playlists for access control.
 */
export async function getPlaylistItemsForUser(playlistId: string): Promise<PlaylistItemRecord[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const adminSupabase = createServiceRoleClient() as any;

    // Step 1: Find user's active QR
    const { data: qrData, error: qrError } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("bound_by_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (qrError || !qrData) {
      return [];
    }

    // Step 2: Get playlist to find its kit_id
    const { data: playlistData, error: playlistError } = await adminSupabase
      .from("playlists")
      .select("kit_id")
      .eq("id", playlistId)
      .is("deleted_at", null)
      .maybeSingle();

    if (playlistError || !playlistData) {
      return [];
    }

    // Step 3: Verify user has active grant for this kit
    const { data: grantData, error: grantError } = await (supabase as any)
      .from("qr_kit_grants")
      .select("kit_id")
      .eq("qr_id", qrData.id)
      .eq("kit_id", playlistData.kit_id)
      .is("revoked_at", null)
      .maybeSingle();

    if (grantError || !grantData) {
      return [];
    }

    // Step 4: User has access - fetch playlist items
    const { data: itemsData, error: itemsError } = await adminSupabase
      .from("playlist_items")
      .select("id, playlist_id, content_id, sort_index, created_at")
      .eq("playlist_id", playlistId)
      .order("sort_index", { ascending: true });

    if (itemsError || !itemsData) {
      return [];
    }

    return itemsData.map(mapDatabaseRowToPlaylistItem);
  } catch {
    return [];
  }
}

/**
 * Get content records for content IDs (user-facing, read-only).
 *
 * SECURITY: Only returns content if user has active QR with active kit grant
 * for a kit that contains the content via kit_items.
 * Does NOT expose content access - only metadata (title, filename).
 */
export async function getUserContentRecords(
  contentIds: string[]
): Promise<Array<{ id: string; title: string | null; filename: string | null; contentType: string }>> {
  const user = await getCurrentUser();

  if (!user || contentIds.length === 0) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();
    const adminSupabase = createServiceRoleClient() as any;

    // Step 1: Find user's active QR
    const { data: qrData, error: qrError } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("bound_by_user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (qrError || !qrData) {
      return [];
    }

    // Step 2: Find active grants for this QR
    const { data: grantsData, error: grantsError } = await (supabase as any)
      .from("qr_kit_grants")
      .select("kit_id")
      .eq("qr_id", qrData.id)
      .is("revoked_at", null);

    if (grantsError || !grantsData || grantsData.length === 0) {
      return [];
    }

    const kitIds = grantsData.map((g: { kit_id: string }) => g.kit_id);

    // Step 3: Verify content is in user's kit_items
    const { data: kitItemsData, error: kitItemsError } = await adminSupabase
      .from("kit_items")
      .select("content_id")
      .in("kit_id", kitIds)
      .in("content_id", contentIds);

    if (kitItemsError || !kitItemsData) {
      return [];
    }

    const accessibleContentIds = new Set(
      kitItemsData.map((item: { content_id: string }) => item.content_id)
    );

    // Step 4: Fetch content metadata only for accessible content
    const { data: contentsData, error: contentsError } = await adminSupabase
      .from("contents")
      .select("id, content_type, title, filename")
      .in("id", Array.from(accessibleContentIds));

    if (contentsError || !contentsData) {
      return [];
    }

    return contentsData.map((row: any) => ({
      id: row.id,
      title: row.title ?? null,
      filename: row.filename ?? null,
      contentType: row.content_type,
    }));
  } catch {
    return [];
  }
}