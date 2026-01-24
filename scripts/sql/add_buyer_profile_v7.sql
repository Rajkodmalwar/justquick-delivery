-- ====================================================
-- MIGRATION: Add buyer profile columns and fix RLS
-- Purpose: Enable users to save name, phone, address
-- Date: Jan 2026
-- ====================================================

-- Step 1: Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- Step 2: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: CRITICAL RLS Policies for Profiles Table

-- ✅ Policy 1: Buyers can read their own profile
CREATE POLICY "Buyers can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ✅ Policy 2: Buyers can update their own profile
CREATE POLICY "Buyers can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ✅ Policy 3: Allow initial profile creation (auto-trigger)
-- This will be done via trigger when user signs up
-- For now, allow insert if authenticated and user_id matches
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ✅ Policy 4: Service role can do anything (for admin/server operations)
-- Service role bypasses RLS, so we don't need explicit policies

-- Step 4: Auto-update timestamp on profile change
CREATE OR REPLACE FUNCTION update_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;

-- Create trigger
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_timestamp();

-- Step 5: Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, created_at)
  VALUES (new.id, 'buyer', now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- VERIFICATION QUERIES (Run these to verify)
-- ====================================================

-- Check profiles table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- ====================================================
-- NOTES
-- ====================================================
-- 1. After running this migration, existing users might not have profiles
--    Run this to create profiles for existing users:
--    INSERT INTO profiles (id, role) 
--    SELECT id, 'buyer' FROM auth.users 
--    WHERE id NOT IN (SELECT id FROM profiles)
--    ON CONFLICT (id) DO NOTHING;

-- 2. RLS is now ENABLED on profiles table
--    Users can only access/update their own profile
--    Service role key bypasses RLS for server operations

-- 3. Timestamps are auto-updated on every profile change
