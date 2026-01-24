-- PostgreSQL Migration
-- Migration: Add buyer profile fields (name, phone, address)
-- Purpose: Store user profile information for buyers
-- Simple SQL version - compatible with Supabase

-- Add columns if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Set default value for role column
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile (required for upsert)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS admin_check
      WHERE admin_check.id = auth.uid() AND admin_check.role = 'admin'
    )
  );
