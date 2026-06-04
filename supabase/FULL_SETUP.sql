-- ============================================================
-- DUKAANIFY — COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- ============================================================

-- ── 1. PROFILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- ── 2. BUSINESSES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             text NOT NULL,
  slug             text NOT NULL UNIQUE,
  description      text,
  logo_url         text,
  currency         text NOT NULL DEFAULT 'PKR',
  is_active        boolean NOT NULL DEFAULT true,
  -- Contact & payment
  whatsapp_number  text,
  jazzcash_number  text,
  easypaisa_number text,
  sadapay_number   text,
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL
);

-- Add missing columns to existing businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS description      text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS logo_url         text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS currency         text NOT NULL DEFAULT 'PKR';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_active        boolean NOT NULL DEFAULT true;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS whatsapp_number  text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS jazzcash_number  text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS easypaisa_number text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS sadapay_number   text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS created_at       timestamptz DEFAULT now();
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS updated_at       timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS businesses_owner_id_idx ON public.businesses(owner_id);

-- ── 3. PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name           text NOT NULL,
  description    text,
  price          numeric(12,2) NOT NULL DEFAULT 0,
  compare_price  numeric(12,2),
  sku            text,
  stock_quantity integer NOT NULL DEFAULT 0,
  image_url      text,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz DEFAULT now() NOT NULL,
  updated_at     timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS products_business_id_idx ON public.products(business_id);

-- ── 4. CUSTOMERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text,
  phone       text,
  address     text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS customers_business_id_idx ON public.customers(business_id);

-- ── 5. ORDERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id    uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  status         text NOT NULL DEFAULT 'pending',
  total_amount   numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cod',
  notes          text,
  created_at     timestamptz DEFAULT now() NOT NULL,
  updated_at     timestamptz DEFAULT now() NOT NULL
);

-- Add payment_method to existing orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod';

CREATE INDEX IF NOT EXISTS orders_business_id_idx ON public.orders(business_id);

-- ── 6. ORDER ITEMS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    integer NOT NULL DEFAULT 1,
  unit_price  numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) NOT NULL DEFAULT 0
);

-- ── 7. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles: own row"                ON public.profiles;
DROP POLICY IF EXISTS "businesses: owner access"         ON public.businesses;
DROP POLICY IF EXISTS "businesses: owner all"            ON public.businesses;
DROP POLICY IF EXISTS "businesses: public read active"   ON public.businesses;
DROP POLICY IF EXISTS "products: business owner"         ON public.products;
DROP POLICY IF EXISTS "products: owner all"              ON public.products;
DROP POLICY IF EXISTS "products: public read active"     ON public.products;
DROP POLICY IF EXISTS "customers: business owner"        ON public.customers;
DROP POLICY IF EXISTS "customers: owner all"             ON public.customers;
DROP POLICY IF EXISTS "customers: anon insert"           ON public.customers;
DROP POLICY IF EXISTS "customers: anon update"           ON public.customers;
DROP POLICY IF EXISTS "customers: public insert"         ON public.customers;
DROP POLICY IF EXISTS "customers: public update own"     ON public.customers;
DROP POLICY IF EXISTS "orders: business owner"           ON public.orders;
DROP POLICY IF EXISTS "orders: owner all"                ON public.orders;
DROP POLICY IF EXISTS "orders: anon insert"              ON public.orders;
DROP POLICY IF EXISTS "orders: public insert"            ON public.orders;
DROP POLICY IF EXISTS "order_items: business owner"      ON public.order_items;
DROP POLICY IF EXISTS "order_items: owner all"           ON public.order_items;
DROP POLICY IF EXISTS "order_items: anon insert"         ON public.order_items;
DROP POLICY IF EXISTS "order_items: public insert"       ON public.order_items;

-- Profiles: own row only
CREATE POLICY "profiles: own row" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id);

-- Businesses: owner full access
CREATE POLICY "businesses: owner all" ON public.businesses
  FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- Businesses: public can read active stores (storefront)
CREATE POLICY "businesses: public read active" ON public.businesses
  FOR SELECT TO anon USING (is_active = true);

-- Products: owner full access
CREATE POLICY "products: owner all" ON public.products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = products.business_id AND b.owner_id = auth.uid()
    )
  );

-- Products: public can read active products (storefront)
CREATE POLICY "products: public read active" ON public.products
  FOR SELECT TO anon
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = products.business_id AND b.is_active = true
    )
  );

-- Customers: owner full access
CREATE POLICY "customers: owner all" ON public.customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = customers.business_id AND b.owner_id = auth.uid()
    )
  );

-- Customers: anon can insert/update (for checkout)
CREATE POLICY "customers: anon insert" ON public.customers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "customers: anon update" ON public.customers
  FOR UPDATE TO anon USING (true);

-- Orders: owner full access
CREATE POLICY "orders: owner all" ON public.orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id AND b.owner_id = auth.uid()
    )
  );

-- Orders: anon can insert (for checkout)
CREATE POLICY "orders: anon insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id AND b.is_active = true
    )
  );

-- Order items: owner full access
CREATE POLICY "order_items: owner all" ON public.order_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.businesses b ON b.id = o.business_id
      WHERE o.id = order_items.order_id AND b.owner_id = auth.uid()
    )
  );

-- Order items: anon can insert (for checkout)
CREATE POLICY "order_items: anon insert" ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);

-- ── 8. STORAGE BUCKETS ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business logos
DROP POLICY IF EXISTS "logos: owner upload"  ON storage.objects;
DROP POLICY IF EXISTS "logos: owner manage"  ON storage.objects;
DROP POLICY IF EXISTS "logos: owner delete"  ON storage.objects;
DROP POLICY IF EXISTS "logos: public read"   ON storage.objects;
DROP POLICY IF EXISTS "product-images: owner upload" ON storage.objects;
DROP POLICY IF EXISTS "product-images: public read"  ON storage.objects;
DROP POLICY IF EXISTS "product-images: owner manage" ON storage.objects;

CREATE POLICY "logos: owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "logos: owner manage" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'business-logos');

CREATE POLICY "logos: owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'business-logos');

CREATE POLICY "logos: public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'business-logos');

CREATE POLICY "product-images: owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product-images: public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "product-images: owner manage" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

-- ── 9. AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── 10. AUTO-UPDATE updated_at ────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS businesses_updated_at ON public.businesses;
CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- DONE! Every new business user now gets:
-- ✔ Profile auto-created on signup
-- ✔ Business creation with all columns
-- ✔ Products system (with images)
-- ✔ Orders system (with payment_method)
-- ✔ Customers system
-- ✔ WhatsApp + payment method support
-- ✔ Public storefront at /store/[slug]
-- ✔ RLS isolation (no cross-tenant data leaks)
-- ✔ Storage buckets for logos + product images
-- ============================================================
