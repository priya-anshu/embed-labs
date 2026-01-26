/**
 * Admin API route: Update or delete playlist.
 *
 * PATCH /api/admin/playlists/[playlistId] - Update playlist
 * DELETE /api/admin/playlists/[playlistId] - Soft delete playlist
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/features/auth";
import { getCurrentUserRoleFromRequest } from "@/features/auth/services/role";
import { updatePlaylist, softDeletePlaylist } from "@/features/qr/services/admin/playlists";

interface RouteParams {
  params: Promise<{ playlistId: string }>;
}

export async function PATCH(
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
    const body = await request.json();
    const { name, description } = body;

    const result = await updatePlaylist({ playlistId, name, description });

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
    const result = await softDeletePlaylist(playlistId);

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
