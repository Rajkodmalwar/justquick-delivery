-- PostgreSQL Migration
-- Add new columns to shops table for detailed shop info
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS shop_type text,
ADD COLUMN IF NOT EXISTS seller_name text,
ADD COLUMN IF NOT EXISTS owner_name text,
ADD COLUMN IF NOT EXISTS owner_phone text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS photo text;

-- Add photo column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS photo text;
