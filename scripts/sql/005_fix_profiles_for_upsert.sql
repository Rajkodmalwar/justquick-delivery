-- Migration: Fix profiles table for buyer upsert (name, phone, address)
-- Purpose: Ensure profiles can be created on first save (upsert instead of update)
-- This migration makes the role column have a default value of 'buyer'

-- 1. Add default value to role column if it doesn't have one
DO $$
BEGIN
  -- Check if role column has no default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
    AND column_default IS NULL
  ) THEN
    -- Add default value
    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';
    RAISE NOTICE 'Added default value buyer to role column';
  END IF;
END $$;

-- 2. Verify all required columns exist with correct types
DO $$
BEGIN
  -- Check and add name column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name text;
  END IF;

  -- Check and add phone column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;

  -- Check and add address column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN address text;
  END IF;

  -- Check and add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- 3. Recreate/update RLS policies to allow upsert
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for upsert)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS admin_check
      WHERE admin_check.id = auth.uid() AND admin_check.role = 'admin'
    )
  );

COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users - stores buyer delivery info and user roles';
