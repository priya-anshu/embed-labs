/**
 * Content delivery service.
 *
 * SECURITY-FIRST:
 * - Consumes tokens atomically (single-use)
 * - Validates kit entitlements
 * - Uses service role for validation
 * - Generates signed URLs for secure content delivery
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { consumeAccessToken } from "./tokens";
import { createHash } from "crypto";
import { generateCloudinarySignedUrl } from "@/services/cloudinary";

export interface ContentAccessResult {
  success: boolean;
  contentUrl?: string;
  signedUrl?: string;
  contentType?: string;
  error?:
    | "INVALID_TOKEN"
    | "TOKEN_CONSUMPTION_FAILED"
    | "CONTENT_NOT_FOUND"
    | "ACCESS_DENIED"
    | "SERVICE_CONFIGURATION_ERROR"
    | "UNKNOWN_ERROR";
}

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Validate token and check content access via kit entitlements.
 *
 * Flow:
 * 1. Consume token atomically (single-use, validates expiry, QR active, grant active)
 * 2. Get token's kit_id from consumed token
 * 3. Check if kit has access to requested content (kit_items)
 * 4. Return content metadata or signed URL
 *
 * @param rawToken - Raw access token
 * @param contentType - Content type (e.g., "VIDEO", "FILE", "COURSE")
 * @param contentId - Content ID (UUID)
 * @returns ContentAccessResult with content URL or error
 */
export async function validateContentAccess(
  rawToken: string,
  contentType: string,
  contentId: string
): Promise<ContentAccessResult> {
  if (!rawToken || typeof rawToken !== "string") {
    return { success: false, error: "INVALID_TOKEN" };
  }

  if (!contentType || !contentId) {
    return { success: false, error: "INVALID_TOKEN" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const tokenHash = hashToken(rawToken);

    // Step 1: Consume token atomically
    // Note: consumeAccessToken uses RPC which returns the consumed token row
    // We need to get the kit_id from the consumed token
    const consumeResult = await consumeAccessToken(rawToken);
    if (!consumeResult.success) {
      return {
        success: false,
        error:
          consumeResult.error === "SERVICE_CONFIGURATION_ERROR"
            ? "SERVICE_CONFIGURATION_ERROR"
            : "TOKEN_CONSUMPTION_FAILED",
      };
    }

    // Step 2: Get token's kit_id from consumed token
    // The token was consumed, so used_at is now set
    const { data: tokenData, error: tokenError } = await adminSupabase
      .from("access_tokens")
      .select("kit_id")
      .eq("token_hash", tokenHash)
      .not("used_at", "is", null)
      .single();

    if (tokenError || !tokenData) {
      return { success: false, error: "TOKEN_CONSUMPTION_FAILED" };
    }

    // Token must have a kit_id for content access
    if (!tokenData.kit_id) {
      return { success: false, error: "ACCESS_DENIED" };
    }

    // Step 3: Check if kit has access to requested content
    const { data: kitItemData, error: kitItemError } = await adminSupabase
      .from("kit_items")
      .select("id")
      .eq("kit_id", tokenData.kit_id)
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .maybeSingle();

    if (kitItemError || !kitItemData) {
      return { success: false, error: "ACCESS_DENIED" };
    }

    // Step 4: Generate Cloudinary signed URL for all content types
    let signedUrl: string | undefined;
    const expiresIn = 3600; // 1 hour

    // Map content type to Cloudinary resource type
    let resourceType: "image" | "video" | "raw" | "auto" = "auto";
    if (contentType === "VIDEO") {
      resourceType = "video";
    } else if (contentType === "IMAGE") {
      resourceType = "image";
    } else if (contentType === "FILE") {
      resourceType = "raw";
    }

    // Generate Cloudinary signed URL
    const cloudinaryResult = await generateCloudinarySignedUrl(
      contentId,
      resourceType,
      expiresIn
    );
    if (cloudinaryResult.success && cloudinaryResult.signedUrl) {
      signedUrl = cloudinaryResult.signedUrl;
    }

    // Return content metadata with signed URL (if available)
    return {
      success: true,
      contentUrl: `/content/${contentType.toLowerCase()}/${contentId}`,
      signedUrl,
      contentType,
    };
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return { success: false, error: "SERVICE_CONFIGURATION_ERROR" };
    }
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
