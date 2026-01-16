-- Add 6-digit numeric login codes for vendors and delivery boys
-- Run this migration to add the login_code column

ALTER TABLE shops ADD COLUMN IF NOT EXISTS login_code VARCHAR(6) UNIQUE;
ALTER TABLE delivery_boys ADD COLUMN IF NOT EXISTS login_code VARCHAR(6) UNIQUE;

-- Generate unique 6-digit codes for existing records
UPDATE shops SET login_code = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0') WHERE login_code IS NULL;
UPDATE delivery_boys SET login_code = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0') WHERE login_code IS NULL;

-- Make login_code NOT NULL after populating
ALTER TABLE shops ALTER COLUMN login_code SET NOT NULL;
ALTER TABLE delivery_boys ALTER COLUMN login_code SET NOT NULL;
