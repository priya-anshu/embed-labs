# Migration 002: QR Audit and Revoke Schema

## Migration File
`features/qr/migrations/002_qr_audit_and_revoke.sql`

## How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `features/qr/migrations/002_qr_audit_and_revoke.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Verify success message

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply specific migration
supabase migration up
```

## Verification

After applying the migration, verify:

1. **qr_codes table extended**:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'qr_codes'
   ORDER BY ordinal_position;
   ```
   Should show: `is_active`, `revoked_at`, `revoked_by_admin_id`

2. **Enum exists**:
   ```sql
   SELECT typname FROM pg_type WHERE typname = 'qr_event_action';
   ```
   Should return: `qr_event_action`

3. **qr_events table exists**:
   ```sql
   SELECT * FROM public.qr_events LIMIT 1;
   ```
   Should return empty result (no error)

4. **RLS is enabled on qr_events**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'qr_events';
   ```
   Should return: `rowsecurity = true`

5. **Policy exists**:
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'qr_events';
   ```
   Should show: `"Users can read their own QR events"` with `cmd = SELECT`

6. **Indexes exist**:
   ```sql
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename = 'qr_events';
   ```
   Should show 3 indexes: `idx_qr_events_qr_id`, `idx_qr_events_affected_user_id`, `idx_qr_events_action_created_at`

## Generate Updated TypeScript Types

After migration is applied, regenerate types:

```bash
# Replace YOUR_PROJECT_ID with your actual Supabase project ID
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

**To find your Project ID:**
1. Go to Supabase Dashboard → **Settings** → **General**
2. Copy your **Project ID** (or Reference ID)

**Alternative (if you have Supabase CLI installed globally):**
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

## Verify Types Generated

After generating types, check that `lib/supabase/types.ts` includes:

1. **qr_codes table** with new columns:
   ```typescript
   qr_codes: {
     Row: {
       id: string;
       code: string;
       created_at: string;
       bound_at: string | null;
       bound_by_user_id: string | null;
       metadata: Json | null;
       is_active: boolean;        // ✅ New
       revoked_at: string | null; // ✅ New
       revoked_by_admin_id: string | null; // ✅ New
     };
     // ...
   };
   ```

2. **qr_events table**:
   ```typescript
   qr_events: {
     Row: {
       id: string;
       qr_id: string;
       admin_id: string | null;
       affected_user_id: string | null;
       action: Database["public"]["Enums"]["qr_event_action"];
       details: Json | null;
       created_at: string;
     };
     // ...
   };
   ```

3. **qr_event_action enum**:
   ```typescript
   Enums: {
     qr_event_action: "GENERATED" | "BOUND" | "REVOKED" | "REASSIGNED";
   };
   ```

## Next Steps

After migration and types are generated:

1. ✅ Verify build still passes: `npm run build`
2. ✅ Verify existing QR binding logic still works
3. ⏳ Admin service logic will be implemented in next phase
4. ⏳ Admin UI will be implemented later

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Drop policy
DROP POLICY IF EXISTS "Users can read their own QR events" ON public.qr_events;

-- Drop table
DROP TABLE IF EXISTS public.qr_events CASCADE;

-- Drop enum
DROP TYPE IF EXISTS public.qr_event_action CASCADE;

-- Remove columns from qr_codes
ALTER TABLE public.qr_codes
DROP COLUMN IF EXISTS is_active,
DROP COLUMN IF EXISTS revoked_at,
DROP COLUMN IF EXISTS revoked_by_admin_id;
```

**Warning**: Rollback will delete all audit events and revocation data. Only use if necessary.
