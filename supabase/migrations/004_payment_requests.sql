-- Payment requests table for manual payment system
create table public.payment_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  plan_id     text not null,
  plan_name   text not null,
  plan_price  text not null,
  payment_method text not null,
  transaction_id text not null,
  screenshot_url text not null,
  status      text not null default 'pending',
  admin_notes text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index payment_requests_user_id_idx on public.payment_requests(user_id);
create index payment_requests_status_idx on public.payment_requests(status);

-- Enable RLS
alter table public.payment_requests enable row level security;

-- Users can view their own payment requests
create policy "payment_requests: user access" on public.payment_requests
  for select using (auth.uid() = user_id);

-- Users can insert their own payment requests
create policy "payment_requests: user insert" on public.payment_requests
  for insert with check (auth.uid() = user_id);

-- Admin can view all payment requests (via service role)
-- This will be handled via service role in the app
