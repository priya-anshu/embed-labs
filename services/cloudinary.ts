/**
 * Cloudinary service.
 *
 * Generates signed URLs for secure file delivery.
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 */

import { v2 as cloudinary } from "cloudinary";

export interface CloudinarySignedUrlResult {
  success: boolean;
  signedUrl?: string;
  error?: "CONFIGURATION_ERROR" | "INVALID_RESOURCE_ID" | "UNKNOWN_ERROR";
}

export interface CloudinaryUploadResult {
  success: boolean;
  publicId?: string;
  resourceType?: "image" | "video" | "raw";
  secureUrl?: string;
  bytes?: number;
  format?: string;
  originalFilename?: string;
  error?: "CONFIGURATION_ERROR" | "INVALID_FILE" | "UPLOAD_FAILED" | "UNKNOWN_ERROR";
}

/**
 * Initialize Cloudinary configuration.
 */
function initializeCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Generate a signed URL for Cloudinary resource.
 *
 * @param resourceId - Cloudinary public_id
 * @param resourceType - Resource type: "image", "video", "raw", "auto"
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL for resource access
 */
export async function generateCloudinarySignedUrl(
  resourceId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  expiresIn: number = 3600
): Promise<CloudinarySignedUrlResult> {
  const cloudinary = initializeCloudinary();

  if (!cloudinary) {
    return {
      success: false,
      error: "CONFIGURATION_ERROR",
    };
  }

  if (!resourceId || typeof resourceId !== "string") {
    return {
      success: false,
      error: "INVALID_RESOURCE_ID",
    };
  }

  try {
    // Generate signed URL using Cloudinary
    // Cloudinary uses a different signing mechanism for URLs
    // For secure delivery, use the url helper with signed option
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    // Generate signed URL using Cloudinary URL helper
    const signedUrl = cloudinary.url(resourceId, {
      resource_type: resourceType,
      secure: true,
      sign_url: true,
      expires_at: expiresAt,
    });

    return {
      success: true,
      signedUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: "UNKNOWN_ERROR",
    };
  }
}

function inferCloudinaryResourceTypeFromMime(
  mimeType: string | null | undefined
): "image" | "video" | "raw" | "auto" {
  if (!mimeType) return "auto";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
}

export async function uploadToCloudinary(params: {
  fileBuffer: Buffer;
  mimeType?: string | null;
  filename?: string | null;
  folder?: string | null;
  publicId?: string | null;
  tags?: string[];
  context?: Record<string, string>;
}): Promise<CloudinaryUploadResult> {
  const cloudinary = initializeCloudinary();
  if (!cloudinary) {
    return { success: false, error: "CONFIGURATION_ERROR" };
  }

  if (!params.fileBuffer || params.fileBuffer.length === 0) {
    return { success: false, error: "INVALID_FILE" };
  }

  const resourceType = inferCloudinaryResourceTypeFromMime(params.mimeType);

  try {
    const result = await new Promise<any>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType === "auto" ? "auto" : resourceType,
          folder: params.folder ?? undefined,
          public_id: params.publicId ?? undefined,
          tags: params.tags ?? undefined,
          context: params.context ?? undefined,
          // Enforce secure URLs in responses
          secure: true,
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          return resolve(uploadResult);
        }
      );

      upload.end(params.fileBuffer);
    });

    return {
      success: true,
      publicId: result.public_id,
      resourceType: result.resource_type,
      secureUrl: result.secure_url,
      bytes: result.bytes,
      format: result.format,
      originalFilename: result.original_filename,
    };
  } catch {
    return { success: false, error: "UPLOAD_FAILED" };
  }
}
