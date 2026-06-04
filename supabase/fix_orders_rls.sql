-- ============================================================
-- Dukaanify — FIX ORDERS RLS POLICIES
-- Run this in Supabase SQL Editor to fix multi-tenant isolation
-- ============================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "orders: business owner" ON public.orders;
DROP POLICY IF EXISTS "orders: customer own" ON public.orders;
DROP POLICY IF EXISTS "orders: public insert" ON public.orders;

-- ============================================================
-- FIX 1: Business Owner Access (Multi-tenant isolation)
-- Store owners can ONLY see their own store's orders
-- ============================================================
CREATE POLICY "orders: business owner" ON public.orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id 
      AND b.owner_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 2: Customer Own Orders
-- Customers can ONLY see their own orders
-- ============================================================
CREATE POLICY "orders: customer own" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = customer_id);

-- ============================================================
-- FIX 3: Public Insert (Storefront checkout)
-- Anonymous users can create orders for active stores
-- ============================================================
CREATE POLICY "orders: public insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = orders.business_id 
      AND b.is_active = true
    )
  );

-- ============================================================
-- FIX 4: Order Items RLS (for customer access)
-- ============================================================
DROP POLICY IF EXISTS "order_items: customer access" ON public.order_items;

CREATE POLICY "order_items: customer access" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.customer_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 5: Profile Auto-creation (ensure customer_id matches)
-- This ensures new users are automatically set up
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DONE! Multi-tenant isolation is now fixed:
-- ✓ Store owners see ONLY their store's orders
-- ✓ Customers see ONLY their own orders  
-- ✓ Anonymous checkout works for active stores
-- ============================================================
