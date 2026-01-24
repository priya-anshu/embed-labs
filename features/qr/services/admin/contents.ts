/**
 * Admin content services.
 *
 * SECURITY-FIRST:
 * - Uses service role (bypasses RLS)
 * - For contents table (metadata for Cloudinary-hosted assets)
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface ContentRecord {
  id: string;
  contentType: string;
  title: string | null;
  description: string | null;
  filename: string | null;
  mimeType: string | null;
  bytes: number | null;
  createdAt: Date;
  uploadedBy: string | null;
}

export interface CreateContentInput {
  id: string;
  contentType: string;
  title?: string | null;
  description?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  bytes?: number | null;
  uploadedBy?: string | null;
}

export interface ContentResult {
  success: boolean;
  id?: string;
  error?: "INVALID_INPUT" | "UNKNOWN_ERROR";
}

export async function createContent(
  input: CreateContentInput
): Promise<ContentResult> {
  if (!input.id || !input.contentType.trim()) {
    return { success: false, error: "INVALID_INPUT" };
  }

  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { error } = await adminSupabase.from("contents").insert({
      id: input.id,
      content_type: input.contentType.trim(),
      title: input.title ?? null,
      description: input.description ?? null,
      filename: input.filename ?? null,
      mime_type: input.mimeType ?? null,
      bytes: input.bytes ?? null,
      uploaded_by: input.uploadedBy ?? null,
    });

    if (error) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }
    return { success: true, id: input.id };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

export async function listContents(): Promise<ContentRecord[]> {
  try {
    const adminSupabase = createServiceRoleClient() as any;
    const { data, error } = await adminSupabase
      .from("contents")
      .select("id, content_type, title, description, filename, mime_type, bytes, created_at, uploaded_by")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }
    return data.map((row: any) => ({
      id: row.id,
      contentType: row.content_type,
      title: row.title ?? null,
      description: row.description ?? null,
      filename: row.filename ?? null,
      mimeType: row.mime_type ?? null,
      bytes: row.bytes ?? null,
      createdAt: new Date(row.created_at),
      uploadedBy: row.uploaded_by ?? null,
    }));
  } catch {
    return [];
  }
}
