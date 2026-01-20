/**
 * Admin API route: Reassign QR code to user.
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
import { reassignQR } from "@/features/qr/services/admin";
import type { ReassignQROptions } from "@/features/qr/services/admin";

/**
 * POST /api/admin/reassign-qr
 * 
 * Request body: {
 *   userId: string,
 *   metadata?: Json,
 *   revokeOldQR?: boolean,
 *   oldQRId?: string
 * }
 * Response: { success: boolean, newQRId?: string, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Require authenticated session
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Verify admin role (server-side only)
    const role = await getCurrentUserRole();
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { userId, metadata, revokeOldQR, oldQRId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // Build options object
    const options: ReassignQROptions = {
      userId,
      metadata: metadata ?? undefined,
      revokeOldQR: revokeOldQR === true,
      oldQRId: oldQRId && typeof oldQRId === "string" ? oldQRId : undefined,
    };

    // 4. Call admin service
    // Note: If SUPABASE_SERVICE_ROLE_KEY is missing, createServiceRoleClient()
    // will throw with a clear error message
    const result = await reassignQR(options, user.id);

    if (!result.success) {
      // Map service errors to appropriate HTTP status codes
      const statusCode =
        result.error === "USER_NOT_FOUND" ? 404
        : result.error === "INVALID_METADATA" ? 400
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
