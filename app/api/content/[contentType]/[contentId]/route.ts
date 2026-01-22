/**
 * Content delivery API route.
 *
 * SECURITY-FIRST:
 * - Requires access token (query param or header)
 * - Consumes token atomically
 * - Validates kit entitlements
 * - Serves content or redirects
 */

import { NextRequest, NextResponse } from "next/server";
import { validateContentAccess } from "@/features/qr/services/content";

interface RouteParams {
  params: Promise<{
    contentType: string;
    contentId: string;
  }>;
}

/**
 * GET /api/content/[contentType]/[contentId]?token=...
 *
 * Query params:
 * - token: Raw access token (required)
 *
 * Response:
 * - 200: Content metadata or redirect
 * - 400: Invalid request
 * - 401: Invalid/expired token
 * - 403: Access denied
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { contentType, contentId } = await params;

    // Get token from query param
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "TOKEN_REQUIRED" },
        { status: 400 }
      );
    }

    // Validate token and check access
    const result = await validateContentAccess(token, contentType, contentId);

    if (!result.success) {
      const statusCode =
        result.error === "INVALID_TOKEN" || result.error === "TOKEN_CONSUMPTION_FAILED"
          ? 401
          : result.error === "ACCESS_DENIED"
          ? 403
          : result.error === "CONTENT_NOT_FOUND"
          ? 404
          : result.error === "SERVICE_CONFIGURATION_ERROR"
          ? 500
          : 500;

      return NextResponse.json(result, { status: statusCode });
    }

    // Return content metadata with signed URL
    // If signed URL is available, return it for direct playback
    // Otherwise, return metadata for client-side handling
    return NextResponse.json({
      success: true,
      contentUrl: result.contentUrl,
      signedUrl: result.signedUrl,
      contentType: result.contentType,
      message: "Content access granted. Token consumed.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
