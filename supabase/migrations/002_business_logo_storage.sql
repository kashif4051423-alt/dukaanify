-- ============================================================
-- Migration 002: Business logo storage bucket + policy
-- ============================================================

-- Create a public storage bucket for business logos
insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "logos: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'business-logos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update/delete their own logos
create policy "logos: owner manage"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'business-logos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "logos: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'business-logos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for all logos (they're displayed on storefronts)
create policy "logos: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'business-logos');

-- Add updated_at auto-update trigger for businesses
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();
