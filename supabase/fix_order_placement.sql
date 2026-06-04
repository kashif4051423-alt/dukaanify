-- ============================================================
-- DUKAANIFY - FIX ORDER PLACEMENT
-- Run this to fix "Failed to fetch" error when placing orders
-- ============================================================

-- ============================================================
-- STEP 1: Add missing columns to orders table
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address text;

-- ============================================================
-- STEP 2: Fix CUSTOMERS table RLS policies
-- (This was blocking checkout because upsert failed)
-- ============================================================

-- Drop old overly-permissive policies
DROP POLICY IF EXISTS "customers: public insert" ON public.customers;
DROP POLICY IF EXISTS "customers: public update own" ON public.customers;

-- NEW INSERT policy: Anonymous users can insert ONLY for active businesses
CREATE POLICY "customers: public insert for active business" ON public.customers
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = customers.business_id AND b.is_active = true
    )
  );

-- NEW UPDATE policy: Allow updates for upsert (on conflict, phone + business_id)
-- This is needed because the placeOrder() function does upsert operations
CREATE POLICY "customers: public update for upsert" ON public.customers
  FOR UPDATE TO anon
  USING (TRUE)
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = customers.business_id AND b.is_active = true
    )
  );

-- NEW SELECT policy: Allow SELECT for checkout flow
-- (Needed so upsert can check if customer already exists)
CREATE POLICY "customers: public select for active business" ON public.customers
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = customers.business_id AND b.is_active = true
    )
  );

-- ============================================================
-- STEP 3: Verify ORDERS table RLS policies are correct
-- ============================================================

-- Drop and recreate to ensure correctness
DROP POLICY IF EXISTS "orders: public insert" ON public.orders;

-- Allow anonymous users to INSERT orders for ACTIVE stores only
CREATE POLICY "orders: public insert for active business" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id AND b.is_active = true
    )
  );

-- ============================================================
-- STEP 4: Fix ORDER_ITEMS table RLS policies
-- ============================================================

DROP POLICY IF EXISTS "order_items: public insert" ON public.order_items;

-- Allow anonymous users to insert order items (for checkout)
CREATE POLICY "order_items: public insert for active business" ON public.order_items
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.businesses b ON b.id = o.business_id
      WHERE o.id = order_items.order_id AND b.is_active = true
    )
  );

-- ============================================================
-- STEP 5: Ensure PRODUCTS can be read during checkout
-- (Verify existing policy works)
-- ============================================================

-- This policy should already exist from setup.sql
-- Just verify it's there:
-- "products: public read active" allows anon to SELECT active products
-- from active businesses

-- ============================================================
-- DONE! Order placement should now work!
-- ============================================================

-- To test:
-- 1. Go to a store page
-- 2. Add a product to cart
-- 3. Click "Checkout"
-- 4. Fill the form and click "Place Order"
-- 5. Should see success (not "Failed to fetch" error)

