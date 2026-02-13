# Apply Onboarding Fields Migration

## What This Migration Does

Adds the following columns to the `user_profiles` table:
- `name` (TEXT) - User's name
- `work_style` (TEXT) - How the user works best
- `motivation_type` (TEXT) - What drives the user
- `metadata` (JSONB) - Flexible storage for:
  - `life_season`
  - `biggest_challenge`
  - `energy_pattern`
  - `communication_style`
  - `onboarding_completed`
- `onboarding_step` (INTEGER) - Track onboarding progress
- `onboarding_data` (JSONB) - Store temporary onboarding data

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `add_onboarding_fields.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply the specific migration
psql -h <your-db-host> -U postgres -d postgres -f supabase/migrations/add_onboarding_fields.sql
```

## Verify Migration

Run this query in SQL Editor to verify:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY column_name;
```

You should see all the new columns listed.
