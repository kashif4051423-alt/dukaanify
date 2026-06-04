-- ============================================================
-- Migration 003: Product images storage bucket + policies
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Owner can upload into their own folder (user_id/business_id/...)
create policy "product-images: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product-images: owner manage"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product-images: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for storefront display
create policy "product-images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

-- Auto updated_at for products
create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();
