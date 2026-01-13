# TypeScript Type Generation Instructions

## Current Status

The QR binding code uses temporary type assertions (`as any`) because the `qr_codes` table doesn't exist in the TypeScript types yet.

**This is expected and safe** - the code will work correctly once the migration is applied and types are generated.

## Steps to Generate Types

### 1. Apply Migration First

Make sure the migration has been applied to your Supabase database:
- See `MIGRATION_INSTRUCTIONS.md` for details
- Verify the `qr_codes` table exists in your database

### 2. Get Your Supabase Project ID

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **General**
3. Copy your **Project ID** (or Reference ID)

### 3. Generate Types

Run this command (replace `YOUR_PROJECT_ID` with your actual project ID):

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

**Alternative**: If you have Supabase CLI installed globally:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

### 4. Verify Types Generated

Check that `lib/supabase/types.ts` now includes:

```typescript
export interface Database {
  public: {
    Tables: {
      qr_codes: {
        Row: {
          id: string;
          code: string;
          created_at: string;
          bound_at: string | null;
          bound_by_user_id: string | null;
          metadata: Json | null;
        };
        // ... more type definitions
      };
    };
  };
}
```

### 5. Remove Type Assertions

After types are generated, remove the temporary type assertions:

**In `features/qr/services/bind.ts`:**
```typescript
// Change from:
const { data, error } = await (supabase as any).from("qr_codes")

// To:
const { data, error } = await supabase.from("qr_codes")
```

**In `features/qr/services/verify.ts`:**
```typescript
// Change from:
const { data, error } = await (supabase as any).from("qr_codes")

// To:
const { data, error } = await supabase.from("qr_codes")
```

### 6. Verify Build

Run the build to ensure everything compiles:

```bash
npm run build
```

## Regenerating Types

If you make schema changes, regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

## Troubleshooting

**Error: "Project not found"**
- Verify your Project ID is correct
- Make sure you're authenticated: `npx supabase login`

**Error: "Table qr_codes not found"**
- Make sure migration has been applied
- Check table exists: `SELECT * FROM public.qr_codes LIMIT 1;`

**Type errors after generation**
- Make sure you're using the latest Supabase CLI
- Try regenerating types
- Check that migration was applied correctly

## Notes

- Type assertions (`as any`) are **safe** - they don't affect runtime behavior
- Code will work correctly even with type assertions
- Types are for development-time safety, not runtime validation
- Always regenerate types after schema changes
