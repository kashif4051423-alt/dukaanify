-- Add unique constraint for customer phone per business
-- This allows the same phone number to be used in different businesses
-- but prevents duplicate phone numbers within the same business

ALTER TABLE customers
ADD CONSTRAINT customers_business_phone_unique UNIQUE (business_id, phone);
