/**
 * Admin API route: Revoke QR code (soft revoke).
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
import { revokeQR } from "@/features/qr/services/admin";

/**
 * POST /api/admin/revoke-qr
 * 
 * Request body: { qrId: string }
 * Response: { success: boolean, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Require authenticated session
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Verify admin role (server-side only)
    const role = await getCurrentUserRoleFromRequest(request);
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { qrId } = body;

    if (!qrId || typeof qrId !== "string") {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // 4. Call admin service
    // Note: If SUPABASE_SERVICE_ROLE_KEY is missing, createServiceRoleClient()
    // will throw with a clear error message
    const result = await revokeQR(qrId, user.id);

    if (!result.success) {
      // Map service errors to appropriate HTTP status codes
      const statusCode =
        result.error === "NOT_FOUND" ? 404
        : result.error === "ALREADY_REVOKED" ? 409
        : result.error === "NOT_BOUND" ? 400
        : 500;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle missing service role key or other unexpected errors
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
