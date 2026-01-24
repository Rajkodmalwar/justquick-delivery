-- PostgreSQL Migration
-- Migration: Fix profiles table for buyer upsert (name, phone, address)
-- Purpose: Ensure profiles can be created on first save (upsert instead of update)
-- Simple version without DO blocks for Supabase compatibility

-- 1. Add columns if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Set default value for role column to 'buyer'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- 5. Recreate RLS policies to allow upsert (insert + update)

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (required for upsert to work)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS admin_check
      WHERE admin_check.id = auth.uid() AND admin_check.role = 'admin'
    )
  );

