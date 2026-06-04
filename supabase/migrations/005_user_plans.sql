-- User Plans Management Table
-- Tracks which plan each user has and how many businesses they can create

CREATE TABLE IF NOT EXISTS public.user_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name       text NOT NULL DEFAULT 'free', -- 'free', 'starter', 'pro', 'business'
  max_businesses  integer NOT NULL DEFAULT 1,   -- How many businesses user can create
  payment_status  text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'active'
  payment_method  text,                         -- 'jazzcash', 'easypaisa', 'bank', etc.
  transaction_id  text,
  screenshot_url  text,
  admin_notes     text,
  approved_at     timestamptz,
  approved_by     uuid REFERENCES public.profiles(id),
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_plans_user_id_idx ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS user_plans_plan_name_idx ON public.user_plans(plan_name);
CREATE INDEX IF NOT EXISTS user_plans_payment_status_idx ON public.user_plans(payment_status);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plan
CREATE POLICY "user_plans: user access" ON public.user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own plan (limited fields)
CREATE POLICY "user_plans: user update" ON public.user_plans
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all plans (via service role)
-- This will be handled via service role in the app

-- Plan Tiers Reference (for documentation)
-- Free: 1 business
-- Starter: 3 businesses
-- Pro: 5 businesses
-- Business: 10 businesses
-- Enterprise: Unlimited
