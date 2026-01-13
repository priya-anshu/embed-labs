-- Migration: Create qr_codes table and RLS policies
-- Description: Implements QR binding system with permanent ownership
-- Security: Restrictive RLS, permanent binding, atomic operations

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bound_at TIMESTAMPTZ,
  bound_by_user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  metadata JSONB DEFAULT NULL,
  
  -- Ensure code is UUID v4 format
  CONSTRAINT qr_code_format CHECK (
    code ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  
  -- Ensure bound_at is set when bound_by_user_id is set
  CONSTRAINT qr_binding_consistency CHECK (
    (bound_by_user_id IS NULL AND bound_at IS NULL) OR
    (bound_by_user_id IS NOT NULL AND bound_at IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_bound_by 
  ON public.qr_codes(bound_by_user_id) 
  WHERE bound_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qr_codes_unbound 
  ON public.qr_codes(code) 
  WHERE bound_by_user_id IS NULL;

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: SELECT - Users can ONLY read QRs bound to them
-- SECURITY: Restrictive - no access to unbound QRs
-- Binding success is inferred via UPDATE result, not SELECT
CREATE POLICY "Users can read only their own bound QRs"
ON public.qr_codes
FOR SELECT
USING (
  bound_by_user_id = auth.uid()
);

-- RLS Policy 2: UPDATE - Users can bind unbound QRs only
-- SECURITY: Immutability enforced via atomic UPDATE WHERE clause
-- No OLD-value subqueries needed
CREATE POLICY "Users can bind unbound QRs only"
ON public.qr_codes
FOR UPDATE
USING (
  bound_by_user_id IS NULL
)
WITH CHECK (
  bound_by_user_id = auth.uid() AND
  bound_by_user_id IS NOT NULL
);

-- Note: NO INSERT policy - users cannot create QR codes
-- Note: NO DELETE policy - QR codes are permanent records
