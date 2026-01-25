/**
 * User API route: Get playlist items (read-only).
 *
 * SECURITY-FIRST:
 * - Requires authenticated session
 * - Validates user has active QR with active kit grant for playlist's kit
 * - Read-only (no mutations)
 * - Does NOT use playlists for access control
 *
 * GET /api/playlists/[playlistId]/items
 * Response: { success: true, items: PlaylistItemRecord[] }
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth";
import { getPlaylistItemsForUser } from "@/features/qr/services/read";

interface RouteParams {
  params: Promise<{ playlistId: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { playlistId } = await params;
    const items = await getPlaylistItemsForUser(playlistId);

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
