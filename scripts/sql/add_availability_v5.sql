-- PostgreSQL Migration
-- Add is_available column to delivery_boys table
ALTER TABLE delivery_boys 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
