/**
 * Admin API route: Revoke kit grant from QR.
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
import { revokeKitGrant } from "@/features/qr/services/admin/kits";

/**
 * POST /api/admin/kits/revoke-grant
 * 
 * Request body: { grantId?: string, qrId?: string, kitId?: string }
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
    const { grantId, qrId, kitId } = body;

    if (!grantId && (!qrId || !kitId)) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const result = await revokeKitGrant({
      grantId: grantId && typeof grantId === "string" ? grantId : undefined,
      qrId: qrId && typeof qrId === "string" ? qrId : undefined,
      kitId: kitId && typeof kitId === "string" ? kitId : undefined,
      adminId: user.id,
    });

    if (!result.success) {
      const statusCode =
        result.error === "NOT_FOUND" ? 404
        : result.error === "INVALID_INPUT" ? 400
        : 500;
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
