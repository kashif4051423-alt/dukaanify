-- ============================================================
-- Migration 005: Performance Indexes
-- Adds missing indexes for frequently queried columns
-- ============================================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_business_status_idx ON public.orders(business_id, status);
CREATE INDEX IF NOT EXISTS orders_business_created_idx ON public.orders(business_id, created_at DESC);

-- Products table indexes
CREATE INDEX IF NOT EXISTS products_is_active_idx ON public.products(is_active);
CREATE INDEX IF NOT EXISTS products_business_active_idx ON public.products(business_id, is_active);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS customers_phone_idx ON public.customers(phone);
CREATE INDEX IF NOT EXISTS customers_business_phone_idx ON public.customers(business_id, phone);

-- Businesses table indexes
CREATE INDEX IF NOT EXISTS businesses_slug_idx ON public.businesses(slug);

-- Order items indexes
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);
