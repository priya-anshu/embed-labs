/**
 * Admin API route: Remove content from playlist.
 *
 * DELETE /api/admin/playlists/[playlistId]/items?contentId=...
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/features/auth";
import { getCurrentUserRoleFromRequest } from "@/features/auth/services/role";
import { removeContentFromPlaylist } from "@/features/qr/services/admin/playlists";

interface RouteParams {
  params: Promise<{ playlistId: string }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const role = await getCurrentUserRoleFromRequest(request);
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const { playlistId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await removeContentFromPlaylist(playlistId, contentId);

    if (!result.success) {
      const statusCode =
        result.error === "INVALID_INPUT" ? 400 : 500;
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
