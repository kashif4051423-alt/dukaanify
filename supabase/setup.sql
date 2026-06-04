-- ============================================================
-- Dukaanify — Run this ONCE in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- 2. Businesses table
create table if not exists public.businesses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  currency    text not null default 'PKR',
  is_active   boolean not null default true,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- If businesses table already exists but is missing columns, add them:
alter table public.businesses add column if not exists description text;
alter table public.businesses add column if not exists logo_url    text;
alter table public.businesses add column if not exists currency    text not null default 'PKR';
alter table public.businesses add column if not exists is_active   boolean not null default true;
alter table public.businesses add column if not exists whatsapp_number text;
alter table public.businesses add column if not exists created_at  timestamptz default now();
alter table public.businesses add column if not exists updated_at  timestamptz default now();

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);

-- 3. Products table
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  name             text not null,
  description      text,
  price            numeric(12,2) not null default 0,
  compare_price    numeric(12,2),
  sku              text,
  stock_quantity   integer not null default 0,
  image_url        text,
  is_active        boolean not null default true,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index if not exists products_business_id_idx on public.products(business_id);

-- 4. Customers table
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  name         text not null,
  email        text,
  phone        text,
  address      text,
  created_at   timestamptz default now() not null
);

create index if not exists customers_business_id_idx on public.customers(business_id);

-- 5. Orders table
do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'pending','confirmed','processing','shipped','delivered','cancelled'
    );
  end if;
end $$;

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  customer_id       uuid references public.customers(id) on delete set null,
  status            text not null default 'pending',
  total_amount      numeric(12,2) not null default 0,
  notes             text,
  payment_method    text default 'cod',
  customer_email    text,
  customer_phone    text,
  delivery_address  text,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

create index if not exists orders_business_id_idx on public.orders(business_id);

-- 6. Order items table
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete restrict,
  quantity     integer not null default 1,
  unit_price   numeric(12,2) not null default 0,
  total_price  numeric(12,2) not null default 0
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.businesses  enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Drop existing policies to avoid conflicts, then recreate
drop policy if exists "profiles: own row"           on public.profiles;
drop policy if exists "businesses: owner access"    on public.businesses;
drop policy if exists "businesses: public read active" on public.businesses;
drop policy if exists "products: business owner"    on public.products;
drop policy if exists "products: public read active" on public.products;
drop policy if exists "customers: business owner"   on public.customers;
drop policy if exists "customers: public insert"    on public.customers;
drop policy if exists "customers: public update own" on public.customers;
drop policy if exists "orders: business owner"      on public.orders;
drop policy if exists "orders: public insert"       on public.orders;
drop policy if exists "order_items: business owner" on public.order_items;
drop policy if exists "order_items: public insert"  on public.order_items;

-- Profiles
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- Businesses — owner full access
create policy "businesses: owner access" on public.businesses
  for all using (auth.uid() = owner_id);

-- Businesses — public can read active stores (for storefront)
create policy "businesses: public read active" on public.businesses
  for select to anon using (is_active = true);

-- Products — owner access
create policy "products: business owner" on public.products
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.owner_id = auth.uid()
    )
  );

-- Products — public can read active products
create policy "products: public read active" on public.products
  for select to anon using (
    is_active = true and
    exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.is_active = true
    )
  );

-- Customers — owner access
create policy "customers: business owner" on public.customers
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.owner_id = auth.uid()
    )
  );

-- Customers — public can insert (for checkout) - restricted to active businesses
create policy "customers: public insert for active business" on public.customers
  for insert to anon with check (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.is_active = true
    )
  );

-- Customers — public can select (needed for upsert operations)
create policy "customers: public select for active business" on public.customers
  for select to anon using (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.is_active = true
    )
  );

-- Customers — public can update (needed for upsert on conflict)
create policy "customers: public update for upsert" on public.customers
  for update to anon
  using (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.is_active = true
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.is_active = true
    )
  );

-- Orders — owner access
create policy "orders: business owner" on public.orders
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.owner_id = auth.uid()
    )
  );

-- Orders — public can insert (for checkout)
create policy "orders: public insert for active business" on public.orders
  for insert to anon with check (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.is_active = true
    )
  );

-- Order items — owner access
create policy "order_items: business owner" on public.order_items
  for all using (
    exists (
      select 1 from public.orders o
      join public.businesses b on b.id = o.business_id
      where o.id = order_items.order_id and b.owner_id = auth.uid()
    )
  );

-- Order items — public can insert (for checkout)
create policy "order_items: public insert for active business" on public.order_items
  for insert to anon with check (
    exists (
      select 1 from public.orders o
      join public.businesses b on b.id = o.business_id
      where o.id = order_items.order_id and b.is_active = true
    )
  );

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Done! All tables, RLS policies, and triggers are set up.
-- ============================================================
