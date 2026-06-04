-- ============================================================
-- Dukaanify — Initial Schema
-- Multi-tenant: each user (profile) owns multiple businesses.
-- All business data is scoped by business_id + RLS policies.
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Businesses (one user → many businesses)
create table public.businesses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  currency    text not null default 'INR',
  is_active   boolean not null default true,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index businesses_owner_id_idx on public.businesses(owner_id);

-- Products (scoped to a business)
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  name             text not null,
  description      text,
  price            numeric(12,2) not null,
  compare_price    numeric(12,2),
  sku              text,
  stock_quantity   integer not null default 0,
  image_url        text,
  is_active        boolean not null default true,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index products_business_id_idx on public.products(business_id);

-- Customers (scoped to a business)
create table public.customers (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  name         text not null,
  email        text,
  phone        text,
  address      text,
  created_at   timestamptz default now() not null
);

create index customers_business_id_idx on public.customers(business_id);

-- Order status enum
create type order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled');

-- Orders (scoped to a business)
create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  customer_id   uuid references public.customers(id) on delete set null,
  status        order_status not null default 'pending',
  total_amount  numeric(12,2) not null,
  notes         text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index orders_business_id_idx on public.orders(business_id);

-- Order items
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete restrict,
  quantity     integer not null,
  unit_price   numeric(12,2) not null,
  total_price  numeric(12,2) not null
);

-- ============================================================
-- Row Level Security (RLS) — tenant isolation at DB level
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.businesses  enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Profiles: users can only read/update their own profile
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- Businesses: owner can do everything
create policy "businesses: owner access" on public.businesses
  for all using (auth.uid() = owner_id);

-- Products: accessible if user owns the parent business
create policy "products: business owner" on public.products
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.owner_id = auth.uid()
    )
  );

-- Customers: same pattern
create policy "customers: business owner" on public.customers
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id and b.owner_id = auth.uid()
    )
  );

-- Orders: same pattern
create policy "orders: business owner" on public.orders
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.owner_id = auth.uid()
    )
  );

-- Order items: accessible via order → business → owner
create policy "order_items: business owner" on public.order_items
  for all using (
    exists (
      select 1 from public.orders o
      join public.businesses b on b.id = o.business_id
      where o.id = order_items.order_id and b.owner_id = auth.uid()
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
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
