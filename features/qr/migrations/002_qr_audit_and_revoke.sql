-- Migration: Extend qr_codes with revocation fields and add qr_events audit log
-- Description: Implements soft revoke, append-only audit logging, and basic RLS for qr_events

----------------------------
-- 1. Extend public.qr_codes
----------------------------

ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS revoked_by_admin_id UUID REFERENCES auth.users(id);

-- Optional consistency constraint:
-- When is_active = FALSE, revoked_at SHOULD be set.
-- We keep this as a soft invariant; enforcement can be added later if desired.

----------------------------
-- 2. Create qr_event_action enum
----------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'qr_event_action'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.qr_event_action AS ENUM (
      'GENERATED',
      'BOUND',
      'REVOKED',
      'REASSIGNED'
    );
  END IF;
END$$;

----------------------------
-- 3. Create public.qr_events table
----------------------------

CREATE TABLE IF NOT EXISTS public.qr_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- QR this event refers to
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id),

  -- Admin who initiated the action (NULL for user-driven events)
  admin_id UUID REFERENCES auth.users(id),

  -- User affected by the action (e.g., owner of the QR)
  affected_user_id UUID REFERENCES auth.users(id),

  -- Event type (generated, bound, revoked, reassigned)
  action public.qr_event_action NOT NULL,

  -- Optional, non-sensitive contextual data (e.g., old/new QR IDs)
  details JSONB DEFAULT NULL,

  -- When the event was recorded
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_qr_events_qr_id
  ON public.qr_events(qr_id);

CREATE INDEX IF NOT EXISTS idx_qr_events_affected_user_id
  ON public.qr_events(affected_user_id);

CREATE INDEX IF NOT EXISTS idx_qr_events_action_created_at
  ON public.qr_events(action, created_at);

----------------------------
-- 4. Enable RLS on qr_events
----------------------------

ALTER TABLE public.qr_events ENABLE ROW LEVEL SECURITY;

----------------------------
-- 5. RLS policy for user visibility
----------------------------

-- Users can read events where they are the affected user.
-- Admin view/audit will use service role and bypass RLS.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'qr_events'
      AND policyname = 'Users can read their own QR events'
  ) THEN
    CREATE POLICY "Users can read their own QR events"
    ON public.qr_events
    FOR SELECT
    USING (affected_user_id = auth.uid());
  END IF;
END$$;

-- Note:
-- - No INSERT / UPDATE / DELETE policies are defined for authenticated users.
--   This keeps qr_events effectively append-only from the perspective of
--   non-service-role clients. Admin writes will use the service role key.

