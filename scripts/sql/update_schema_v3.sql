-- Update shops table with new columns
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS shop_type text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS seller_name text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS owner_phone text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS photo text;

-- Update products table with photo column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo text;

-- Make lat/lng optional (default to 0)
ALTER TABLE public.shops ALTER COLUMN lat SET DEFAULT 0;
ALTER TABLE public.shops ALTER COLUMN lng SET DEFAULT 0;

-- Enable RLS on all tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_boys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Public read access for shops and products (anyone can browse)
CREATE POLICY "Anyone can view shops" ON public.shops
FOR SELECT USING (true);

CREATE POLICY "Anyone can view products" ON public.products
FOR SELECT USING (true);

-- Service role full access (admin ops)
CREATE POLICY "Service role can manage shops" ON public.shops
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage products" ON public.products
FOR ALL USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view their orders" ON public.orders
FOR SELECT USING (true);

CREATE POLICY "Service role can update orders" ON public.orders
FOR UPDATE USING (true) WITH CHECK (true);

-- Delivery boys
CREATE POLICY "Anyone can view delivery boys" ON public.delivery_boys
FOR SELECT USING (true);

CREATE POLICY "Service role can manage delivery boys" ON public.delivery_boys
FOR ALL USING (true) WITH CHECK (true);

-- Commissions
CREATE POLICY "Anyone can view commissions" ON public.commissions
FOR SELECT USING (true);

CREATE POLICY "Service role can manage commissions" ON public.commissions
FOR ALL USING (true) WITH CHECK (true);
