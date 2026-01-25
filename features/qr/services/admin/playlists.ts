/**
 * Admin playlist services.
 *
 * SECURITY-FIRST:
 * - Uses service role (bypasses RLS)
 * - Validates inputs
 * - Soft delete for playlists
 * - Organization layer only (no access control changes)
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface PlaylistRecord {
  id: string;
  kitId: string;
  name: string;
  description: string | null;
  sortIndex: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface PlaylistItemRecord {
  id: string;
  playlistId: string;
  contentId: string;
  sortIndex: number;
  createdAt: Date;
}

export interface CreatePlaylistInput {
  kitId: string;
  name: string;
  description?: string | null;
}

export interface UpdatePlaylistInput {
  playlistId: string;
  name?: string;
  description?: string | null;
}

export interface PlaylistResult {
  success: boolean;
  id?: string;
  error?: "INVALID_INPUT" | "NOT_FOUND" | "UNKNOWN_ERROR";
}

export async function createPlaylist(
  input: CreatePlaylistInput
): Promise<PlaylistResult> {
  if (!input.kitId || !input.name.trim()) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;

    // Get max sort_index for this kit to append at end
    const { data: maxData } = await adminSupabase
      .from("playlists")
      .select("sort_index")
      .eq("kit_id", input.kitId)
      .is("deleted_at", null)
      .order("sort_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSortIndex = maxData?.sort_index !== undefined ? maxData.sort_index + 1 : 0;

    const { data, error } = await adminSupabase
      .from("playlists")
      .insert({
        kit_id: input.kitId,
        name: input.name.trim(),
        description: input.description ?? null,
        sort_index: nextSortIndex,
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

export async function updatePlaylist(
  input: UpdatePlaylistInput
): Promise<PlaylistResult> {
  if (!input.playlistId) {
    return { success: false, error: "INVALID_INPUT" };
  }

  if (!input.name && input.description === undefined) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.description !== undefined) updateData.description = input.description ?? null;

    const { data, error } = await adminSupabase
      .from("playlists")
      .update(updateData)
      .eq("id", input.playlistId)
      .is("deleted_at", null)
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

export async function softDeletePlaylist(
  playlistId: string
): Promise<PlaylistResult> {
  if (!playlistId) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { data, error } = await adminSupabase
      .from("playlists")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", playlistId)
      .is("deleted_at", null)
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

export async function addContentToPlaylist(
  playlistId: string,
  contentId: string
): Promise<PlaylistResult> {
  if (!playlistId || !contentId) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;

    // Verify playlist exists and is not deleted
    const { data: playlistData, error: playlistError } = await adminSupabase
      .from("playlists")
      .select("id")
      .eq("id", playlistId)
      .is("deleted_at", null)
      .single();

    if (playlistError || !playlistData) {
      return { success: false, error: "NOT_FOUND" };
    }

    // Get max sort_index for this playlist
    const { data: maxData } = await adminSupabase
      .from("playlist_items")
      .select("sort_index")
      .eq("playlist_id", playlistId)
      .order("sort_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSortIndex = maxData?.sort_index !== undefined ? maxData.sort_index + 1 : 0;

    const { data, error } = await adminSupabase
      .from("playlist_items")
      .insert({
        playlist_id: playlistId,
        content_id: contentId,
        sort_index: nextSortIndex,
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

export async function removeContentFromPlaylist(
  playlistId: string,
  contentId: string
): Promise<PlaylistResult> {
  if (!playlistId || !contentId) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { error } = await adminSupabase
      .from("playlist_items")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("content_id", contentId);

    if (error) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

export async function reorderPlaylistItems(
  playlistId: string,
  orderedContentIds: string[]
): Promise<PlaylistResult> {
  if (!playlistId || !Array.isArray(orderedContentIds)) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;

    // Verify playlist exists and is not deleted
    const { data: playlistData, error: playlistError } = await adminSupabase
      .from("playlists")
      .select("id")
      .eq("id", playlistId)
      .is("deleted_at", null)
      .single();

    if (playlistError || !playlistData) {
      return { success: false, error: "NOT_FOUND" };
    }

    // Update sort_index for each item
    for (let i = 0; i < orderedContentIds.length; i++) {
      const { error } = await adminSupabase
        .from("playlist_items")
        .update({ sort_index: i })
        .eq("playlist_id", playlistId)
        .eq("content_id", orderedContentIds[i]);

      if (error) {
        return { success: false, error: "UNKNOWN_ERROR" };
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

export async function getPlaylistsByKit(kitId: string): Promise<PlaylistRecord[]> {
  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { data, error } = await adminSupabase
      .from("playlists")
      .select("id, kit_id, name, description, sort_index, created_at, deleted_at")
      .eq("kit_id", kitId)
      .is("deleted_at", null)
      .order("sort_index", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      kitId: row.kit_id,
      name: row.name,
      description: row.description ?? null,
      sortIndex: row.sort_index,
      createdAt: new Date(row.created_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    }));
  } catch {
    return [];
  }
}

export async function getPlaylistItems(
  playlistId: string
): Promise<PlaylistItemRecord[]> {
  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { data, error } = await adminSupabase
      .from("playlist_items")
      .select("id, playlist_id, content_id, sort_index, created_at")
      .eq("playlist_id", playlistId)
      .order("sort_index", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      playlistId: row.playlist_id,
      contentId: row.content_id,
      sortIndex: row.sort_index,
      createdAt: new Date(row.created_at),
    }));
  } catch {
    return [];
  }
}
