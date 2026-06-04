-- ============================================================
-- DUKAANIFY — Fix Data Separation Between Stores
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ── STEP 1: Ensure all required columns exist ─────────────────

-- orders table must have business_id and payment_method
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS business_id    uuid REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at     timestamptz DEFAULT now();

-- products table must have business_id
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE;

-- customers table must have business_id
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE;

-- ── STEP 2: Add indexes for fast filtering ────────────────────
CREATE INDEX IF NOT EXISTS orders_business_id_idx    ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS products_business_id_idx  ON public.products(business_id);
CREATE INDEX IF NOT EXISTS customers_business_id_idx ON public.customers(business_id);

-- ── STEP 3: Fix RLS — drop all old policies and recreate ──────

-- Enable RLS on all tables
ALTER TABLE public.businesses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop every possible old policy name
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

-- ── Businesses ────────────────────────────────────────────────
-- Authenticated users can only see/edit their own businesses
CREATE POLICY "businesses: owner all" ON public.businesses
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id);

-- Public (storefront visitors) can read active businesses
CREATE POLICY "businesses: public read active" ON public.businesses
  FOR SELECT TO anon
  USING (is_active = true);

-- ── Products ──────────────────────────────────────────────────
-- Owner can manage products of their own businesses
CREATE POLICY "products: owner all" ON public.products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = products.business_id   -- filter by THIS store
        AND b.owner_id = auth.uid()        -- must be the owner
    )
  );

-- Public can read active products (for storefront)
CREATE POLICY "products: public read active" ON public.products
  FOR SELECT TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = products.business_id
        AND b.is_active = true
    )
  );

-- ── Customers ─────────────────────────────────────────────────
-- Owner can see customers of their own businesses
CREATE POLICY "customers: owner all" ON public.customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = customers.business_id  -- filter by THIS store
        AND b.owner_id = auth.uid()
    )
  );

-- Storefront visitors can create/update customers (for checkout)
CREATE POLICY "customers: anon insert" ON public.customers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "customers: anon update" ON public.customers
  FOR UPDATE TO anon USING (true);

-- ── Orders ────────────────────────────────────────────────────
-- Owner can see orders of their own businesses ONLY
CREATE POLICY "orders: owner all" ON public.orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id     -- filter by THIS store
        AND b.owner_id = auth.uid()        -- must be the owner
    )
  );

-- Storefront visitors can create orders (for checkout)
CREATE POLICY "orders: anon insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id
        AND b.is_active = true
    )
  );

-- ── Order Items ───────────────────────────────────────────────
-- Owner can see order items of their own businesses
CREATE POLICY "order_items: owner all" ON public.order_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.businesses b ON b.id = o.business_id
      WHERE o.id = order_items.order_id
        AND b.owner_id = auth.uid()
    )
  );

-- Storefront visitors can create order items (for checkout)
CREATE POLICY "order_items: anon insert" ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);

-- ── STEP 4: Verify your data is correctly separated ───────────

-- Check Ali Bakery orders (should only show Ali Bakery orders)
SELECT
  o.id,
  o.business_id,
  b.name AS store_name,
  o.status,
  o.total_amount,
  o.payment_method,
  o.created_at
FROM public.orders o
JOIN public.businesses b ON b.id = o.business_id
WHERE o.business_id = '6cd75bb1-f55b-4623-af0b-58542c6b508b'  -- Ali Bakery
ORDER BY o.created_at DESC;

-- Check Pizza Hut orders (should only show Pizza Hut orders)
SELECT
  o.id,
  o.business_id,
  b.name AS store_name,
  o.status,
  o.total_amount,
  o.created_at
FROM public.orders o
JOIN public.businesses b ON b.id = o.business_id
WHERE o.business_id = '7095c716-fa62-4f22-ba04-d61f9adf8cb3'  -- Pizza Hut
ORDER BY o.created_at DESC;

-- Check if any orders are missing business_id (these are the broken ones)
SELECT id, status, total_amount, created_at
FROM public.orders
WHERE business_id IS NULL;

-- Check products per store
SELECT
  p.name,
  p.price,
  p.business_id,
  b.name AS store_name
FROM public.products p
JOIN public.businesses b ON b.id = p.business_id
ORDER BY b.name, p.name;
