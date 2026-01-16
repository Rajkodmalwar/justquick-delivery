-- Add buyer_address column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_address text;
