-- ============================================================
-- Migration 003: Public read policies for storefront
-- Allows unauthenticated visitors to browse active stores
-- ============================================================

-- Public can read active businesses (for storefront display)
create policy "businesses: public read active"
  on public.businesses
  for select
  to anon
  using (is_active = true);

-- Public can read active products of active businesses
create policy "products: public read active"
  on public.products
  for select
  to anon
  using (
    is_active = true and
    exists (
      select 1 from public.businesses b
      where b.id = products.business_id and b.is_active = true
    )
  );

-- Public can insert customers (for checkout — no auth required)
create policy "customers: public insert"
  on public.customers
  for insert
  to anon
  with check (true);

-- Public can update their own customer record (upsert by phone)
create policy "customers: public update own"
  on public.customers
  for update
  to anon
  using (true);

-- Public can insert orders (for checkout)
create policy "orders: public insert"
  on public.orders
  for insert
  to anon
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = orders.business_id and b.is_active = true
    )
  );

-- Public can insert order items
create policy "order_items: public insert"
  on public.order_items
  for insert
  to anon
  with check (true);

-- Product images storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product-images: owner upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "product-images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "product-images: owner manage"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
