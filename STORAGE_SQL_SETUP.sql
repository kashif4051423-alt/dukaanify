-- Supabase Storage RLS Policies for Dukaanify Product Images
-- Copy and paste each policy into Supabase SQL Editor
-- OR use Supabase Dashboard → Storage → product-images bucket → Policies tab

-- ============================================================
-- IMPORTANT: Before running these policies:
-- 1. Create bucket: "product-images" with visibility: PUBLIC
-- 2. Enable RLS on storage.objects table
-- ============================================================

-- POLICY 1: Public can view all images (SELECT)
-- ============================================================
-- Customers should see product images without authentication
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- POLICY 2: Authenticated users can upload to their business folder (INSERT)
-- ============================================================
-- Users can only upload images to their own business's folder
-- Path must start with their businessId
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

-- POLICY 3: Authenticated users can update their own images (UPDATE)
-- ============================================================
-- Users can only modify/update images in their own business folder
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

-- POLICY 4: Authenticated users can delete their own images (DELETE)
-- ============================================================
-- Users can only delete images from their own business folder
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

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if policies are enabled on storage.objects
SELECT 
  tablename,
  rowlevel,
  array_agg(policyname) as policies
FROM pg_policies
WHERE tablename = 'objects'
GROUP BY tablename, rowlevel;

-- Check all policies on storage.objects
SELECT
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- ============================================================
-- CLEANUP (if needed)
-- ============================================================
-- Run this if you need to drop and recreate policies

-- DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- ============================================================
-- HOW YOUR APP USES THIS:
-- ============================================================

-- 1. USER UPLOADS IMAGE:
--    Path: businessId/timestamp.jpg
--    RLS checks: User must own that businessId ✓
--    Example: 550e8400-e29b-41d4-a716-446655440000/1704067200000.jpg

-- 2. CUSTOMER VIEWS IMAGE:
--    URL: https://[project].supabase.co/storage/v1/object/public/product-images/{businessId}/{file}
--    RLS checks: Public SELECT policy allows anyone ✓
--    No authentication required ✓

-- 3. USER DELETES IMAGE:
--    Path: businessId/timestamp.jpg
--    RLS checks: User must own that businessId ✓
--    Only the owner can delete ✓

-- ============================================================
-- TESTING POLICIES
-- ============================================================

-- Test 1: Can I (authenticated user) upload to my business folder?
-- SELECT auth.uid() -- See your user ID
-- SELECT id FROM businesses WHERE owner_id = auth.uid() -- Your businesses

-- Test 2: Can public view images without auth?
-- Yes - SELECT policy is USING (bucket_id = 'product-images')
-- No conditions on auth, so anyone can SELECT

-- Test 3: Can user A delete user B's images?
-- No - DELETE policy checks:
-- (storage.foldername(name))[1] IN (
--   SELECT id FROM businesses WHERE owner_id = auth.uid()
-- )
-- User A's businesses won't include User B's businessId
