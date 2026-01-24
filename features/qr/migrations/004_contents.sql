-- Migration: Contents table (metadata for Cloudinary-hosted assets)
-- Phase 7B. id = content_id used in kit_items and as Cloudinary public_id.
-- Run only if the table does not already exist.

CREATE TABLE IF NOT EXISTS public.contents (
  id UUID PRIMARY KEY,
  content_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  filename TEXT,
  mime_type TEXT,
  bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contents_content_type ON public.contents(content_type);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON public.contents(created_at DESC);

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- No RLS policies: admin operations use service role (bypasses RLS).
