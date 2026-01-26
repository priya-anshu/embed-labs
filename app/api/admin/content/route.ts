/**
 * Admin API: List content.
 *
 * GET /api/admin/content
 * Response: { success: true, items: ContentRecord[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/features/auth";
import { getCurrentUserRoleFromRequest } from "@/features/auth/services/role";
import { listContents } from "@/features/qr/services/admin/contents";

export async function GET(request: NextRequest) {
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

    const items = await listContents();
    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
