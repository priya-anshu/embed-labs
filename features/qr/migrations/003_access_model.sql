-- Migration: Access model (kits, kit_items, qr_kit_grants, access_tokens)
-- Description: Implements QR -> Kit -> Token access model with single-use tokens.

----------------------------
-- 1. Kits
----------------------------

CREATE TABLE IF NOT EXISTS public.kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

----------------------------
-- 2. Kit items (entitlements)
----------------------------

CREATE TABLE IF NOT EXISTS public.kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES public.kits(id),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT kit_items_unique UNIQUE (kit_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_kit_items_kit_id
  ON public.kit_items(kit_id);

----------------------------
-- 3. Kit grants to QR (license -> entitlements)
----------------------------

CREATE TABLE IF NOT EXISTS public.qr_kit_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id),
  kit_id UUID NOT NULL REFERENCES public.kits(id),
  granted_by_admin_id UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by_admin_id UUID REFERENCES auth.users(id)
);

-- Partial unique: only one ACTIVE grant per (qr_id, kit_id)
CREATE UNIQUE INDEX IF NOT EXISTS uq_qr_kit_grants_active
  ON public.qr_kit_grants(qr_id, kit_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_qr_kit_grants_qr_id
  ON public.qr_kit_grants(qr_id);

----------------------------
-- 4. Access tokens (single-use, hashed)
----------------------------

CREATE TABLE IF NOT EXISTS public.access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL, -- store ONLY hash, never raw
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  kit_id UUID REFERENCES public.kits(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  issued_ip INET,
  issued_user_agent TEXT,
  purpose TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_access_tokens_token_hash
  ON public.access_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_access_tokens_qr_id
  ON public.access_tokens(qr_id);

CREATE INDEX IF NOT EXISTS idx_access_tokens_user_id
  ON public.access_tokens(user_id);

----------------------------
-- 5. RLS enablement (service role will bypass)
----------------------------

ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_kit_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- No user-facing policies are defined here.
-- Admin/service operations use the service role key (bypasses RLS).

----------------------------
-- 6. Atomic token consumption function
----------------------------

-- This enforces single-use, expiry, revocation, QR active, and active grant.
CREATE OR REPLACE FUNCTION public.consume_access_token(p_token_hash TEXT)
RETURNS public.access_tokens
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.access_tokens t
  SET used_at = NOW()
  WHERE t.token_hash = p_token_hash
    AND t.used_at IS NULL
    AND t.revoked_at IS NULL
    AND t.expires_at > NOW()
    AND EXISTS (
      SELECT 1 FROM public.qr_codes q
      WHERE q.id = t.qr_id
        AND q.is_active = TRUE
    )
    AND (
      t.kit_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.qr_kit_grants g
        WHERE g.qr_id = t.qr_id
          AND g.kit_id = t.kit_id
          AND g.revoked_at IS NULL
      )
    )
  RETURNING *;
$$;

-- Note: SECURITY DEFINER allows the function to run with table owner rights,
-- while access control is enforced by the caller's ability to reach this RPC
-- (service role usage in server-side code).

