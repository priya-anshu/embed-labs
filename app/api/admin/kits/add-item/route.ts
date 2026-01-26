/**
 * Admin API route: Add item to kit.
 * 
 * SECURITY-FIRST:
 * - Requires authenticated session
 * - Verifies admin role server-side
 * - Uses existing admin service (service role)
 * - Fails safely if SUPABASE_SERVICE_ROLE_KEY is missing
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/features/auth";
import { getCurrentUserRoleFromRequest } from "@/features/auth/services/role";
import { addKitItem } from "@/features/qr/services/admin/kits";

/**
 * POST /api/admin/kits/add-item
 * 
 * Request body: { kitId: string, contentType: string, contentId: string }
 * Response: { success: boolean, id?: string, error?: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { kitId, contentType, contentId } = body;

    if (
      !kitId || typeof kitId !== "string" ||
      !contentType || typeof contentType !== "string" ||
      !contentId || typeof contentId !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await addKitItem({ kitId, contentType, contentId });

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
