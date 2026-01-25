-- ====================================================
-- MIGRATION: Fix existing profiles - migrate full_name to name
-- Purpose: Fix profiles created with wrong column name
-- Status: Run this in Supabase SQL Editor for production
-- ====================================================

-- Step 1: Check how many profiles have data in full_name but not name
SELECT 
  COUNT(*) as profiles_to_fix,
  COUNT(CASE WHEN full_name IS NOT NULL AND name IS NULL THEN 1 END) as need_migration
FROM public.profiles
WHERE (full_name IS NOT NULL AND name IS NULL) 
   OR (full_name IS NOT NULL AND name IS NULL);

-- Step 2: Migrate full_name → name for profiles that need it
UPDATE public.profiles
SET name = full_name
WHERE full_name IS NOT NULL AND (name IS NULL OR name = '');

-- Step 3: Verify the migration
SELECT 
  id, 
  email,
  name, 
  full_name, 
  phone, 
  address,
  updated_at
FROM public.profiles
ORDER BY updated_at DESC
LIMIT 10;

-- Step 4: Optional - Drop full_name column if migration is complete
-- (Only run this AFTER verifying Step 3 shows data in name column)
-- ALTER TABLE public.profiles DROP COLUMN full_name;

-- ====================================================
-- VERIFICATION
-- ====================================================
-- After running this, profiles should have:
-- ✅ name column populated (from full_name)
-- ✅ phone column populated 
-- ✅ address column populated
-- ✅ All other fields present
--
-- If you see NULL in name column after running this,
-- it means those profiles had NULL in full_name too.
-- In that case, populate from email prefix:

UPDATE public.profiles
SET name = SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1)
WHERE name IS NULL AND email IS NOT NULL;
