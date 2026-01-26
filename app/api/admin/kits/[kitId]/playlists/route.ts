/**
 * Admin API route: Create playlist for a kit.
 *
 * POST /api/admin/kits/[kitId]/playlists
 * Body: { name: string, description?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/features/auth";
import { getCurrentUserRoleFromRequest } from "@/features/auth/services/role";
import { createPlaylist } from "@/features/qr/services/admin/playlists";

interface RouteParams {
  params: Promise<{ kitId: string }>;
}

export async function POST(
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

    const { kitId } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await createPlaylist({ kitId, name, description });

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
