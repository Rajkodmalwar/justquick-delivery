-- Shops
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lat double precision not null,
  lng double precision not null,
  contact text
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  image text
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  buyer_name text not null,
  buyer_contact text not null,
  buyer_lat double precision not null,
  buyer_lng double precision not null,
  products jsonb not null,
  total_price numeric(10,2) not null,
  status text not null check (status in ('pending','accepted','ready','picked_up','delivered','rejected')),
  payment_type text not null check (payment_type in ('COD','ONLINE')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  otp text not null,
  delivery_boy_id uuid,
  shop_lat double precision not null,
  shop_lng double precision not null,
  created_at timestamptz not null default now()
);

-- DeliveryBoys
create table if not exists public.delivery_boys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  total_commission numeric(10,2) not null default 0
);

-- Commissions
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  delivery_boy_id uuid not null references public.delivery_boys(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(10,2) not null,
  paid_status text not null default 'unpaid' check (paid_status in ('unpaid','paid')),
  unique(order_id)
);

-- Profiles: link to auth.users for roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','vendor','delivery','buyer')),
  vendor_shop_id uuid references public.shops(id) on delete set null,
  delivery_boy_id uuid references public.delivery_boys(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Realtime
alter publication supabase_realtime add table public.orders;

-- Note: Add RLS policies for each table as needed for production usage.
