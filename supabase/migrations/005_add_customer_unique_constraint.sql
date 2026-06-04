-- Add unique constraint on (business_id, phone) for customers table
-- This allows upsert to work properly when placing orders

alter table public.customers
add constraint customers_business_id_phone_unique unique (business_id, phone);
