-- ============================================
-- SUPABASE STORAGE RLS POLICIES - DUKAANIFY
-- Bucket: product-images
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This enables multi-tenant product image uploads with proper access control

-- Step 1: Drop existing policies (safe - creates fresh setup)
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- Step 2: Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICY 1: SELECT - Public Read Access
-- ============================================
-- Anyone can view all product images (customers don't need to login to see products)
-- Use Case: Storefront product display, image galleries
-- Restrictions: None - bucket_id must be 'product-images'
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- ============================================
-- POLICY 2: INSERT - Authenticated Upload
-- ============================================
-- Only authenticated business owners can upload images
-- Restriction: Can only upload to their own business folder
-- Path structure: {businessId}/{filename}
-- The policy extracts the first folder name and validates it against the businesses table
CREATE POLICY "Users can upload to their business folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id FROM businesses
    WHERE owner_id = auth.uid()
  )
  AND auth.role() = 'authenticated'
);

-- ============================================
-- POLICY 3: UPDATE - Authenticated Modification
-- ============================================
-- Only authenticated business owners can update (modify) images
-- Restriction: Can only update images in their own business folder
-- This typically applies to metadata updates via the Supabase client
CREATE POLICY "Users can update their own product images"
ON storage.objects
FOR UPDATE
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id FROM businesses
    WHERE owner_id = auth.uid()
  )
  AND auth.role() = 'authenticated'
);

-- ============================================
-- POLICY 4: DELETE - Authenticated Deletion
-- ============================================
-- Only authenticated business owners can delete images
-- Restriction: Can only delete images in their own business folder
-- Triggered when business owners remove products or update images
CREATE POLICY "Users can delete their own product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id FROM businesses
    WHERE owner_id = auth.uid()
  )
  AND auth.role() = 'authenticated'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after creating policies to verify setup:

-- Check if policies were created
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check if RLS is enabled
-- SELECT * FROM pg_tables WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verify your businesses exist
-- SELECT id, owner_id, name FROM businesses LIMIT 5;

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Public: Can view all images (SELECT allowed)
-- ✅ Authenticated: Can upload to their business folder (INSERT allowed)
-- ✅ Authenticated: Can modify images in their folder (UPDATE allowed)
-- ✅ Authenticated: Can delete images from their folder (DELETE allowed)
-- ✅ Security: No cross-business access - each user isolated to their own business folder
