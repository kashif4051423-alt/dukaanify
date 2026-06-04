-- ============================================================
-- Add payment method support to Dukaanify
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Add payment_method column to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod';
  -- values: 'cod' | 'jazzcash' | 'easypaisa' | 'sadapay'

-- 2. Add payment account numbers to businesses (set by owner in Settings)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS jazzcash_number 03269415471,
  ADD COLUMN IF NOT EXISTS easypaisa_number 03269415471,
  ADD COLUMN IF NOT EXISTS sadapay_number   03269415471;

-- Done!
