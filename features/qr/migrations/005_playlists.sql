-- Migration: Playlists / Modules (Phase 7C)
-- Organization layer ONLY. No access or delivery changes.
-- Kit -> Playlists -> ordered Content. Access still via kit_items only.
--
-- Run after 004_contents. No changes to existing tables.

----------------------------
-- 1. playlists (modules)
-- One kit, many playlists. Soft-delete. Ordered within kit.
----------------------------

CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_playlists_kit_id
  ON public.playlists(kit_id);
CREATE INDEX IF NOT EXISTS idx_playlists_kit_active
  ON public.playlists(kit_id, sort_index)
  WHERE deleted_at IS NULL;

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
-- No RLS policies: admin uses service role.

----------------------------
-- 2. playlist_items (ordered content in a playlist)
-- Same content may appear in multiple playlists. One row per (playlist, content).
----------------------------

CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  sort_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_playlist_content UNIQUE (playlist_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist
  ON public.playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_sort
  ON public.playlist_items(playlist_id, sort_index);

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
-- No RLS policies: admin uses service role.
