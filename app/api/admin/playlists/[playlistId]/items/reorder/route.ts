/**
 * Admin API route: Reorder content in playlist.
 *
 * PATCH /api/admin/playlists/[playlistId]/items/reorder
 * Body: { orderedContentIds: string[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth";
import { getCurrentUserRole } from "@/features/auth/services/role";
import { reorderPlaylistItems } from "@/features/qr/services/admin/playlists";

interface RouteParams {
  params: Promise<{ playlistId: string }>;
}

export async function PATCH(
  request: NextRequest,
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

    const role = await getCurrentUserRole();
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const { playlistId } = await params;
    const body = await request.json();
    const { orderedContentIds } = body;

    if (!Array.isArray(orderedContentIds)) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await reorderPlaylistItems(playlistId, orderedContentIds);

    if (!result.success) {
      const statusCode =
        result.error === "INVALID_INPUT" ? 400 :
        result.error === "NOT_FOUND" ? 404 : 500;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "SERVICE_CONFIGURATION_ERROR",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
