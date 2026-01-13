# QR Binding Foundation - Security-First Design

## Overview

This document outlines the **APPROVED** database design and security flow for QR-based permanent access binding in embedLabs. This is an **irreversible access control system** designed like a license system, not a feature.

## Security-First Principles (NON-NEGOTIABLE)

1. **QR codes are ADMIN-GENERATED ONLY** - Users can NEVER create QR codes
2. **Binding is UPDATE-ONLY and PERMANENT** - No INSERT, no UPSERT, no rebind, no unbind
3. **Atomicity is mandatory** - Database-level guarantees required
4. **QR format: UUID v4 only** - Non-guessable, non-derivable
5. **Metadata is RESTRICTED** - No PII, emails, user identifiers, or secrets
6. **Server-gated reads** - No free enumeration, restrictive RLS
7. **Supabase auth.uid() ONLY** - Never trust client-provided IDs
8. **Permanent binding is ABSOLUTE** - No unbind, no admin override via UI
9. **Auditability is REQUIRED** - bound_at timestamp, immutable ownership

## Core Requirements

1. **Permanent Binding**: Each QR code binds permanently to ONE user
2. **First Scan Lock**: First scan after login → QR gets locked to that user
3. **Subsequent Scans Fail**: Other users cannot bind to an already-bound QR
4. **Database-Level Enforcement**: RLS policies enforce security, not client-side checks
5. **Atomic Operations**: Binding must be atomic to prevent race conditions

## Proposed Database Schema

### Table: `qr_codes`

```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,              -- The actual QR code string/identifier
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bound_at TIMESTAMPTZ,                   -- When binding occurred (NULL = unbound)
  bound_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,                         -- Optional: additional QR metadata
  CONSTRAINT qr_code_unique UNIQUE (code)
);

-- Index for fast lookups
CREATE INDEX idx_qr_codes_code ON qr_codes(code);
CREATE INDEX idx_qr_codes_bound_by ON qr_codes(bound_by_user_id) WHERE bound_by_user_id IS NOT NULL;
```

### Key Design Decisions

1. **`code` field**: The unique QR identifier (could be UUID, hash, or custom string)
2. **`bound_by_user_id`**: NULL = unbound, NOT NULL = permanently bound
3. **`bound_at`**: Timestamp of binding (useful for auditing)
4. **`metadata`**: Flexible JSONB for future extensions (course ID, expiration, etc.)

## Security Flow

### Binding Process (First Scan)

```
1. User authenticates (session exists)
2. User scans QR code → code string extracted
3. Server Action: attemptBindQR(code, userId)
4. Database Operation (atomic):
   a. SELECT qr_codes WHERE code = $1 FOR UPDATE (row-level lock)
   b. IF bound_by_user_id IS NULL:
      - UPDATE SET bound_by_user_id = $2, bound_at = NOW()
      - RETURN success
   c. ELSE:
      - RETURN error: "QR already bound to another user"
5. Return result to client
```

### Verification Process (Subsequent Scans)

```
1. User scans QR code
2. Server Action: verifyQRBinding(code, userId)
3. Database Query:
   SELECT bound_by_user_id FROM qr_codes WHERE code = $1
4. IF bound_by_user_id = userId:
   - RETURN success: "QR belongs to you"
5. ELSE IF bound_by_user_id IS NOT NULL:
   - RETURN error: "QR belongs to another user"
6. ELSE:
   - RETURN info: "QR is unbound"
```

## Proposed RLS Policies

### Policy 1: Users can read their own bound QR codes

```sql
CREATE POLICY "Users can read their own bound QR codes"
ON qr_codes
FOR SELECT
USING (
  bound_by_user_id = auth.uid() OR
  bound_by_user_id IS NULL  -- Allow reading unbound QR codes
);
```

### Policy 2: NO INSERT POLICY FOR USERS

```sql
-- NO INSERT POLICY EXISTS
-- Users CANNOT create QR codes
-- QR codes are ADMIN-GENERATED ONLY
-- Admins use service role key, not RLS
```

### Policy 3: Users can bind unbound QR codes (UPDATE ONLY)

```sql
CREATE POLICY "Users can bind unbound QR codes"
ON qr_codes
FOR UPDATE
USING (
  -- Can only update if currently unbound
  bound_by_user_id IS NULL
)
WITH CHECK (
  -- Can only set bound_by_user_id to their own ID
  bound_by_user_id = auth.uid() AND
  bound_by_user_id IS NOT NULL AND
  -- Cannot change bound_by_user_id if already set
  (OLD.bound_by_user_id IS NULL)
);
```

**Critical Security Notes**:
- Users CANNOT INSERT QR codes (no INSERT policy)
- Users can ONLY UPDATE existing QR codes
- Binding condition: `WHERE bound_by_user_id IS NULL`
- Once bound, `bound_by_user_id` is IMMUTABLE (cannot be changed)
- No rebind, no unbind, no ownership transfer

### Policy 4: NO DELETE POLICY

```sql
-- No DELETE policy = no one can delete QR codes via RLS
-- QR codes are permanent records
-- Any deletion requires manual DB migration + audit
```

## Atomic Binding Implementation

### Critical: Row-Level Locking + Single UPDATE

To prevent race conditions when multiple users scan the same QR simultaneously:

```sql
-- Atomic UPDATE operation (no separate SELECT needed)
UPDATE qr_codes
SET 
  bound_by_user_id = auth.uid(),
  bound_at = NOW()
WHERE 
  code = $1 
  AND bound_by_user_id IS NULL  -- Only bind if unbound
RETURNING *;

-- If 0 rows affected → QR already bound or doesn't exist
-- If 1 row affected → Successfully bound
-- Database guarantees atomicity
```

**Why this works**:
- Single atomic UPDATE operation
- `WHERE bound_by_user_id IS NULL` ensures only unbound QRs can be bound
- Database-level constraint prevents race conditions
- No separate SELECT needed (reduces lock time)
- RLS policy enforces `bound_by_user_id = auth.uid()` constraint

## Core Logic Structure (TypeScript)

### Types (`features/qr/types.ts`)

```typescript
export interface QRCode {
  id: string;
  code: string;
  createdAt: Date;
  boundAt: Date | null;
  boundByUserId: string | null;
  metadata: Record<string, unknown> | null;
}

export interface BindQRResult {
  success: boolean;
  error?: "ALREADY_BOUND" | "INVALID_CODE" | "UNAUTHORIZED" | "UNKNOWN_ERROR";
  qrCode?: QRCode;
}

export interface VerifyQRResult {
  belongsToUser: boolean;
  isBound: boolean;
  qrCode?: QRCode;
}
```

### Services (`features/qr/services/`)

1. **`binding.ts`**: Core binding logic
   - `attemptBindQR(code, userId)`: Atomic binding operation
   - `verifyQRBinding(code, userId)`: Check ownership

2. **`validation.ts`**: QR code validation
   - `validateQRCode(code)`: Validate format
   - `isQRBound(code)`: Check if QR is bound

## Security Considerations

### 1. Race Condition Prevention
- **Row-level locking** (`FOR UPDATE`) ensures only one binding succeeds
- Atomic transaction prevents double-binding

### 2. User Identity
- Always use `auth.uid()` from Supabase session (server-side)
- Never trust client-provided user IDs

### 3. Immutability
- Once `bound_by_user_id` is set, it cannot be changed
- RLS policies enforce this at database level

### 4. Audit Trail
- `bound_at` timestamp provides audit information
- Can extend with additional audit table if needed

## Approved Decisions (FINAL)

1. **QR Code Format**: UUID v4 ONLY - Non-guessable, non-derivable
2. **Metadata Structure**: Restricted to non-sensitive data only (course_id, batch_id, issued_by_admin_id)
3. **Unbinding**: ABSOLUTELY NO - Permanent binding is irreversible
4. **QR Generation**: Admin-only service (separate implementation, not in scope)
5. **Multiple QR per User**: YES - One user can bind multiple QRs
6. **User QR Creation**: NEVER - Users cannot create QR codes
7. **Binding Method**: UPDATE-only, atomic operation
8. **Identity Source**: Supabase auth.uid() ONLY - Never trust client-provided IDs

## Implementation Plan

Once approved, implementation will include:

1. ✅ Type definitions (`features/qr/types.ts`)
2. ✅ Service layer (`features/qr/services/binding.ts`, `validation.ts`)
3. ✅ Server Actions (`features/qr/actions.ts`)
4. ⏳ Database schema (after approval)
5. ⏳ RLS policies (after approval)
6. ⏳ Migration scripts (after approval)

**Next Step**: Review this design and confirm approval before implementation.
