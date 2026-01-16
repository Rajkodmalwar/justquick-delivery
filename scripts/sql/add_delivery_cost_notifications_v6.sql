-- Add delivery_cost to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_cost numeric DEFAULT 0;

-- Create settings table for admin configurations
CREATE TABLE IF NOT EXISTS settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default delivery cost
INSERT INTO settings (key, value) VALUES ('delivery_cost', '30')
ON CONFLICT (key) DO NOTHING;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type text NOT NULL, -- 'user', 'vendor', 'delivery', 'admin'
  target_id text, -- specific user/vendor/driver id, or null for broadcast
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
