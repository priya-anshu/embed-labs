/**
 * Admin API route: Grant kit to QR.
 * 
 * SECURITY-FIRST:
 * - Requires authenticated session
 * - Verifies admin role server-side
 * - Uses existing admin service (service role)
 * - Fails safely if SUPABASE_SERVICE_ROLE_KEY is missing
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth";
import { getCurrentUserRole } from "@/features/auth/services/role";
import { grantKitToQR } from "@/features/qr/services/admin/kits";

/**
 * POST /api/admin/kits/grant
 * 
 * Request body: { qrId: string, kitId: string }
 * Response: { success: boolean, id?: string, error?: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { qrId, kitId } = body;

    if (
      !qrId || typeof qrId !== "string" ||
      !kitId || typeof kitId !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await grantKitToQR({
      qrId,
      kitId,
      adminId: user.id,
    });

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
