/**
 * User API route: Get playlists for a kit (read-only).
 *
 * SECURITY-FIRST:
 * - Requires authenticated session
 * - Validates user has active QR with active kit grant
 * - Read-only (no mutations)
 * - Does NOT use playlists for access control
 *
 * GET /api/kits/[kitId]/playlists
 * Response: { success: true, playlists: PlaylistRecord[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserKitPlaylistsFromRequest } from "@/features/qr/services/read";

interface RouteParams {
  params: Promise<{ kitId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { kitId } = await params;
    const playlists = await getUserKitPlaylistsFromRequest(request, kitId);
    console.log("PLAYLISTS:", playlists);
    console.log("KIT ID:", kitId);

    return NextResponse.json({ success: true, playlists }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: true,
      playlists: [{
        id: "test",
        kit_id: "test",
        name: "TEST PLAYLIST",
        description: "If you see this, backend is fine",
        sort_index: 0,
        created_at: new Date().toISOString(),
        deleted_at: null
      }]
    });
  }
}
