-- ============================================================
-- FIX: Orders not showing in dashboard
-- Run in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- The problem: RLS policies are blocking the authenticated user
-- from reading their own orders, customers, and order_items.

-- ── Step 1: Make sure RLS is enabled ─────────────────────────
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;

-- ── Step 2: Drop ALL old policies (clean slate) ───────────────
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('orders', 'order_items', 'customers', 'products', 'businesses')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END;
$$;

-- ── Step 3: Businesses ────────────────────────────────────────
CREATE POLICY "biz_owner_all" ON public.businesses
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "biz_public_read" ON public.businesses
  FOR SELECT TO anon
  USING (is_active = true);

-- ── Step 4: Products ──────────────────────────────────────────
CREATE POLICY "prod_owner_all" ON public.products
  FOR ALL TO authenticated
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "prod_public_read" ON public.products
  FOR SELECT TO anon
  USING (
    is_active = true
    AND business_id IN (
      SELECT id FROM public.businesses WHERE is_active = true
    )
  );

-- ── Step 5: Customers ─────────────────────────────────────────
CREATE POLICY "cust_owner_all" ON public.customers
  FOR ALL TO authenticated
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Storefront checkout needs to create customers without login
CREATE POLICY "cust_anon_insert" ON public.customers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "cust_anon_update" ON public.customers
  FOR UPDATE TO anon USING (true);

-- ── Step 6: Orders ────────────────────────────────────────────
-- THIS is the key policy — lets the owner see their orders
CREATE POLICY "ord_owner_all" ON public.orders
  FOR ALL TO authenticated
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Storefront checkout needs to create orders without login
CREATE POLICY "ord_anon_insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE is_active = true
    )
  );

-- ── Step 7: Order Items ───────────────────────────────────────
-- THIS is the key policy — lets the owner see order items
CREATE POLICY "items_owner_all" ON public.order_items
  FOR ALL TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.businesses b ON b.id = o.business_id
      WHERE b.owner_id = auth.uid()
    )
  );

-- Storefront checkout needs to create order items without login
CREATE POLICY "items_anon_insert" ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);

-- ── Step 8: Verify it works ───────────────────────────────────
-- Run these SELECT queries to confirm data exists:

-- How many orders do you have total?
SELECT COUNT(*) as total_orders FROM public.orders;

-- Orders with their store names:
SELECT
  o.id,
  b.name as store,
  o.status,
  o.total_amount,
  o.created_at
FROM public.orders o
JOIN public.businesses b ON b.id = o.business_id
ORDER BY o.created_at DESC
LIMIT 20;

-- Order items with product names:
SELECT
  oi.order_id,
  p.name as product,
  oi.quantity,
  oi.unit_price
FROM public.order_items oi
JOIN public.products p ON p.id = oi.product_id
LIMIT 20;
