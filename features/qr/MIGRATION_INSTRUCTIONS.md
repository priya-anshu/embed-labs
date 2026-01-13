# QR Codes Migration Instructions

## Migration File
`features/qr/migrations/001_create_qr_codes_table.sql`

## How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `features/qr/migrations/001_create_qr_codes_table.sql`
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

### Option 3: Direct SQL Execution

If you have direct database access, execute the SQL file contents directly.

## Verification

After applying the migration, verify:

1. **Table exists**:
   ```sql
   SELECT * FROM public.qr_codes LIMIT 1;
   ```

2. **RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'qr_codes';
   -- Should return rowsecurity = true
   ```

3. **Policies exist**:
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'qr_codes';
   -- Should show SELECT and UPDATE policies
   ```

4. **Indexes exist**:
   ```sql
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename = 'qr_codes';
   -- Should show 3 indexes
   ```

## Generate TypeScript Types

After migration is applied, generate types:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Generate types (replace PROJECT_ID with your Supabase project ID)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

Or use the Supabase Dashboard:
1. Go to **Settings** → **API**
2. Find your **Project ID**
3. Use the CLI command above with your Project ID

## Next Steps

1. ✅ Apply migration (see above)
2. ✅ Generate TypeScript types
3. ✅ Code will automatically use proper types (type assertions removed)
4. ✅ Test binding operations

## Rollback (If Needed)

If you need to rollback:

```sql
-- Drop policies
DROP POLICY IF EXISTS "Users can read only their own bound QRs" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can bind unbound QRs only" ON public.qr_codes;

-- Drop table (WARNING: This deletes all data)
DROP TABLE IF EXISTS public.qr_codes CASCADE;
```

**Note**: Rollback will delete all QR code data. Only use if necessary.
