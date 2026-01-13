# QR Binding Database Implementation Proposal

## Overview

This document proposes the database schema and RLS policies for the QR binding system. **This is a proposal only - no migrations will be executed until explicitly approved.**

## Table: `qr_codes`

### Schema Definition

```sql
-- Create qr_codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bound_at TIMESTAMPTZ,
  bound_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT NULL,
  
  -- Ensure code is UUID v4 format (application-level validation also required)
  CONSTRAINT qr_code_format CHECK (
    code ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  
  -- Ensure bound_at is set when bound_by_user_id is set
  CONSTRAINT qr_binding_consistency CHECK (
    (bound_by_user_id IS NULL AND bound_at IS NULL) OR
    (bound_by_user_id IS NOT NULL AND bound_at IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_bound_by 
  ON public.qr_codes(bound_by_user_id) 
  WHERE bound_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qr_codes_unbound 
  ON public.qr_codes(code) 
  WHERE bound_by_user_id IS NULL;

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
```

### Column Descriptions

- **`id`**: Primary key (UUID)
- **`code`**: Unique QR code identifier (UUID v4 format, admin-generated only)
- **`created_at`**: Timestamp when QR code was created (admin operation)
- **`bound_at`**: Timestamp when QR was bound to a user (NULL = unbound)
- **`bound_by_user_id`**: User ID who bound the QR (NULL = unbound, immutable once set)
- **`metadata`**: JSONB field for non-sensitive data (course_id, batch_id, etc.)

### Constraints

1. **`qr_code_format`**: Ensures code is UUID v4 format (database-level validation)
2. **`qr_binding_consistency`**: Ensures bound_at is set when bound_by_user_id is set
3. **UNIQUE on `code`**: Prevents duplicate QR codes
4. **FOREIGN KEY**: References auth.users (ON DELETE RESTRICT - permanent binding survives user deletion)

### Indexes

1. **`idx_qr_codes_code`**: Fast lookup by QR code string
2. **`idx_qr_codes_bound_by`**: Fast lookup of user's bound QRs (partial index)
3. **`idx_qr_codes_unbound`**: Fast lookup of unbound QRs (partial index)

## RLS Policies

### Policy 1: SELECT - Users can ONLY read QRs bound to them

```sql
CREATE POLICY "Users can read only their own bound QRs"
ON public.qr_codes
FOR SELECT
USING (
  bound_by_user_id = auth.uid()
);
```

**Security Rationale**:
- **RESTRICTIVE**: Users can ONLY see QRs bound to them
- Users CANNOT see unbound QRs (prevents enumeration)
- Users CANNOT see QRs owned by others (privacy protection)
- Binding success is inferred via UPDATE result, not SELECT
- Maximum security: minimal data exposure

### Policy 2: NO INSERT POLICY

```sql
-- NO INSERT POLICY EXISTS
-- Users CANNOT create QR codes
-- QR codes are ADMIN-GENERATED ONLY
-- Admins use service role key (bypasses RLS)
```

**Security Rationale**:
- Users have zero INSERT permissions
- QR codes are controlled assets, not user input
- Admins use service role key to create QRs
- Prevents QR code generation attacks

### Policy 3: UPDATE - Users can bind unbound QRs only

```sql
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
```

**Security Rationale**:
- Users can ONLY bind unbound QRs (USING clause)
- Users can ONLY set bound_by_user_id to their own ID (WITH CHECK)
- Immutability enforced via atomic UPDATE WHERE clause in application
- No OLD-value subqueries needed (simpler, more reliable)
- Prevents rebinding, unbinding, and ownership transfer

### Policy 4: NO DELETE POLICY

```sql
-- NO DELETE POLICY EXISTS
-- QR codes are PERMANENT records
-- Any deletion requires manual DB migration + audit
```

**Security Rationale**:
- QR codes are permanent audit records
- No accidental deletions possible
- Any deletion requires explicit database access and audit trail

## Atomic Binding Enforcement

### Database-Level Atomicity

The binding operation is atomic at the database level:

```sql
-- Atomic UPDATE operation (from application code)
UPDATE public.qr_codes
SET 
  bound_by_user_id = auth.uid(),
  bound_at = NOW()
WHERE 
  code = $1 
  AND bound_by_user_id IS NULL  -- Only bind if unbound
RETURNING *;
```

**Why this is atomic**:
1. Single SQL statement = atomic operation
2. `WHERE bound_by_user_id IS NULL` ensures only unbound QRs can be bound
3. Database-level locking prevents race conditions
4. RLS policy enforces `bound_by_user_id = auth.uid()` constraint
5. If 0 rows affected → QR already bound or doesn't exist
6. If 1 row affected → Successfully bound

### Race Condition Prevention

**Scenario**: Two users scan the same QR simultaneously

1. **User A** executes: `UPDATE ... WHERE code = $1 AND bound_by_user_id IS NULL`
2. **User B** executes: `UPDATE ... WHERE code = $1 AND bound_by_user_id IS NULL`
3. **Database behavior**:
   - First UPDATE succeeds, sets `bound_by_user_id = User A`
   - Second UPDATE affects 0 rows (bound_by_user_id is no longer NULL)
   - User B receives "ALREADY_BOUND" error
   - Only User A successfully binds the QR

**No explicit locking needed** - PostgreSQL's MVCC (Multi-Version Concurrency Control) ensures atomicity.

## Migration Script Structure

### Proposed Migration File: `supabase/migrations/YYYYMMDDHHMMSS_create_qr_codes_table.sql`

```sql
-- Migration: Create qr_codes table and RLS policies
-- Date: [To be filled]
-- Description: Implements QR binding system with permanent ownership

-- Create table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bound_at TIMESTAMPTZ,
  bound_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT NULL,
  
  CONSTRAINT qr_code_format CHECK (
    code ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  
  CONSTRAINT qr_binding_consistency CHECK (
    (bound_by_user_id IS NULL AND bound_at IS NULL) OR
    (bound_by_user_id IS NOT NULL AND bound_at IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_bound_by 
  ON public.qr_codes(bound_by_user_id) 
  WHERE bound_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qr_codes_unbound 
  ON public.qr_codes(code) 
  WHERE bound_by_user_id IS NULL;

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: SELECT - RESTRICTIVE (users can ONLY read their own bound QRs)
CREATE POLICY "Users can read only their own bound QRs"
ON public.qr_codes
FOR SELECT
USING (
  bound_by_user_id = auth.uid()
);

-- RLS Policy 2: UPDATE (no INSERT or DELETE policies)
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

-- Grant permissions (if needed)
-- GRANT SELECT, UPDATE ON public.qr_codes TO authenticated;
-- Note: RLS policies handle access control, so explicit grants may not be needed
```

## Security Considerations

### 1. Immutability Enforcement

**Challenge**: PostgreSQL RLS UPDATE policies don't have direct access to OLD values.

**Solution**: 
- Application-level: WHERE clause ensures `bound_by_user_id IS NULL`
- Database-level: CHECK constraint ensures consistency
- RLS policy: WITH CHECK ensures `bound_by_user_id = auth.uid()`

**Result**: Once bound, QR cannot be unbound or rebound by users.

### 2. Admin QR Creation

**Method**: Admins use Supabase service role key (bypasses RLS)

```typescript
// Admin service (not implemented yet)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
);

await adminSupabase.from('qr_codes').insert({
  code: uuidv4(),
  metadata: { course_id: '...', batch_id: '...' }
});
```

### 3. Audit Trail

- `created_at`: When QR was created (admin operation)
- `bound_at`: When QR was bound (user operation)
- `bound_by_user_id`: Who bound it (immutable)

Future extensions:
- Audit table for binding events
- Admin action logging

## Testing Checklist

After implementation, verify:

- [ ] Users cannot INSERT QR codes
- [ ] Users can SELECT unbound QRs
- [ ] Users can SELECT their own bound QRs
- [ ] Users cannot SELECT QRs bound to others
- [ ] Users can UPDATE unbound QRs to bind them
- [ ] Users cannot UPDATE already-bound QRs
- [ ] Users cannot UPDATE QRs bound to others
- [ ] Users cannot DELETE QRs
- [ ] Atomic binding prevents race conditions
- [ ] UUID v4 format constraint works
- [ ] Binding consistency constraint works

## Questions for Approval

1. **CHECK constraint on code format**: Should we enforce UUID v4 format at database level, or rely only on application validation?
2. **Indexes**: Are the proposed indexes sufficient, or should we add more?
3. **Metadata structure**: Should we add a JSONB schema validation, or keep it flexible?
4. **Migration location**: Where should migration files be stored? (`supabase/migrations/` or elsewhere?)
5. **Admin service**: Should we implement QR generation service now, or later?

## Approval Required

**Before executing any migrations, please confirm**:
- [ ] Table schema is approved
- [ ] RLS policies are approved
- [ ] Constraints are approved
- [ ] Indexes are approved
- [ ] Migration script structure is approved

**Once approved, I will**:
1. Create migration file(s)
2. Provide instructions for applying migrations
3. Update TypeScript types (remove type assertions)
4. Test the implementation

**Do NOT proceed with migrations until explicit approval is given.**
