/**
 * User API route: Get content records for content IDs (read-only).
 *
 * SECURITY-FIRST:
 * - Requires authenticated session
 * - Validates user has active QR with active kit grant
 * - Only returns content that exists in user's kit_items
 * - Read-only (no mutations)
 * - Returns metadata only (title, filename, contentType)
 *
 * POST /api/content/batch
 * Body: { contentIds: string[] }
 * Response: { success: true, contents: ContentRecord[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserContentRecordsFromRequest } from "@/features/qr/services/read";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentIds } = body;

    if (!Array.isArray(contentIds)) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const contents = await getUserContentRecordsFromRequest(request, contentIds);

    return NextResponse.json({ success: true, contents }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
