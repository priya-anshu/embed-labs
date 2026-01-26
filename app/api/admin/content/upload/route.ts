/**
 * Admin API route: Upload content to Cloudinary.
 *
 * Phase 7A scope:
 * - Server-side Cloudinary upload helper
 * - Metadata-only response (no playlist logic)
 * - No schema changes
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/features/auth";
import { getCurrentUserRoleFromRequest } from "@/features/auth/services/role";
import { uploadToCloudinary } from "@/services/cloudinary";
import { createContent } from "@/features/qr/services/admin/contents";
import { randomUUID } from "crypto";

function guessContentTypeFromMime(mimeType: string | null | undefined): string {
  if (!mimeType) return "FILE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("image/")) return "IMAGE";
  return "FILE";
}

/**
 * POST /api/admin/content/upload
 *
 * multipart/form-data:
 * - file: File (required)
 * - contentType: string (optional; defaults derived from mime)
 * - title: string (optional)
 * - description: string (optional)
 *
 * Response:
 * - { success: true, contentId, contentType, cloudinary: {...}, metadata: {...} }
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

    const form = await request.formData();
    const file = form.get("file");
    const contentTypeRaw = form.get("contentType");
    const titleRaw = form.get("title");
    const descriptionRaw = form.get("description");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST", message: "file is required" },
        { status: 400 }
      );
    }

    const mimeType = file.type || null;
    const filename = file.name || null;
    const contentType =
      typeof contentTypeRaw === "string" && contentTypeRaw.trim()
        ? contentTypeRaw.trim().toUpperCase()
        : guessContentTypeFromMime(mimeType);

    // Keep contentId aligned with current delivery model:
    // contentId is used as Cloudinary public_id (and later as kit_items.content_id).
    // We generate a UUID string and use it as public_id for consistent addressing.
    const contentId = randomUUID();

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await uploadToCloudinary({
      fileBuffer: buffer,
      mimeType,
      filename,
      publicId: contentId,
      tags: ["embed-labs", "phase-7a"],
      context: {
        title: typeof titleRaw === "string" ? titleRaw : "",
        description: typeof descriptionRaw === "string" ? descriptionRaw : "",
        uploaded_by: user.id,
      },
    });

    if (!uploadResult.success) {
      const statusCode =
        uploadResult.error === "CONFIGURATION_ERROR"
          ? 500
          : uploadResult.error === "INVALID_FILE"
          ? 400
          : 500;

      return NextResponse.json(uploadResult, { status: statusCode });
    }

    const title = typeof titleRaw === "string" ? titleRaw : null;
    const description = typeof descriptionRaw === "string" ? descriptionRaw : null;

    const persistResult = await createContent({
      id: contentId,
      contentType,
      title,
      description,
      filename,
      mimeType,
      bytes: uploadResult.bytes ?? null,
      uploadedBy: user.id,
    });

    if (!persistResult.success) {
      return NextResponse.json(
        { success: false, error: "PERSIST_FAILED", message: "Upload succeeded but metadata save failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        contentId,
        contentType,
        cloudinary: {
          publicId: uploadResult.publicId,
          resourceType: uploadResult.resourceType,
          secureUrl: uploadResult.secureUrl,
          bytes: uploadResult.bytes,
          format: uploadResult.format,
          originalFilename: uploadResult.originalFilename,
        },
        metadata: {
          title,
          description,
          mimeType,
          filename,
        },
      },
      { status: 200 }
    );
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

