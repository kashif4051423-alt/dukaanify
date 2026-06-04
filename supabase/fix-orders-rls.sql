-- ============================================================
-- Fix: Orders dashboard — customer info + order items not showing
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- The issue: RLS policies on customers and order_items block
-- the nested select (JOIN) even when the owner queries orders.
-- Fix: add explicit SELECT policies for authenticated owners.

-- Drop old policies first to avoid conflicts
drop policy if exists "customers: business owner"    on public.customers;
drop policy if exists "order_items: business owner"  on public.order_items;

-- Customers: owner can do everything (select, insert, update, delete)
create policy "customers: owner all" on public.customers
  for all
  to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = customers.business_id
        and b.owner_id = auth.uid()
    )
  );

-- Order items: owner can do everything
create policy "order_items: owner all" on public.order_items
  for all
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      join public.businesses b on b.id = o.business_id
      where o.id = order_items.order_id
        and b.owner_id = auth.uid()
    )
  );

-- Also ensure orders policy covers SELECT explicitly
drop policy if exists "orders: business owner" on public.orders;

create policy "orders: owner all" on public.orders
  for all
  to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id
        and b.owner_id = auth.uid()
    )
  );

-- Public insert policies (for storefront checkout — keep these)
drop policy if exists "customers: public insert"     on public.customers;
drop policy if exists "customers: public update own" on public.customers;
drop policy if exists "orders: public insert"        on public.orders;
drop policy if exists "order_items: public insert"   on public.order_items;

create policy "customers: anon insert" on public.customers
  for insert to anon with check (true);

create policy "customers: anon update" on public.customers
  for update to anon using (true);

create policy "orders: anon insert" on public.orders
  for insert to anon
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.is_active = true
    )
  );

create policy "order_items: anon insert" on public.order_items
  for insert to anon with check (true);

-- Also allow products SELECT for order_items join
drop policy if exists "products: business owner" on public.products;

create policy "products: owner all" on public.products
  for all
  to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = products.business_id
        and b.owner_id = auth.uid()
    )
  );
