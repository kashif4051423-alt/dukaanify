# Supabase Storage Implementation Guide - Dukaanify

## Overview

This document provides the exact SQL and implementation details for setting up Supabase Storage with RLS policies for multi-tenant product image uploads.

---

## Quick Setup (3 Steps)

### Step 1: Create Bucket in Supabase Dashboard
- Go to **Storage** → **New Bucket**
- Name: `product-images`
- Visibility: **Public**
- Click **Create**

### Step 2: Enable RLS on storage.objects
Copy this into **Supabase SQL Editor** and run:

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create RLS Policies
Copy the complete SQL policy script below and run in **SQL Editor**.

---

## Complete SQL Setup Script

Run this entire block in **Supabase Dashboard → SQL Editor**:

```sql
-- ============================================
-- SUPABASE STORAGE RLS POLICIES SETUP
-- Bucket: product-images
-- ============================================

-- Drop existing policies (safe if they don't exist)
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICY 1: SELECT - Public Read Access
-- ============================================
-- Anyone (authenticated or not) can VIEW all product images
-- This allows customers to see products without logging in
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- ============================================
-- POLICY 2: INSERT - Authenticated Upload
-- ============================================
-- Only authenticated users can upload images
-- RESTRICTION: Images must be uploaded to their own business folder
-- Path validation: first folder in path must match a business they own
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
-- Only authenticated users can update (modify) images
-- RESTRICTION: Can only update images in their own business folder
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
-- Only authenticated users can delete images
-- RESTRICTION: Can only delete images in their own business folder
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
```

---

## Policy Details & Logic

### Understanding the RLS Policies

#### Policy: "Public can view all images"
- **Operation:** SELECT (read)
- **Who:** Anyone (no authentication required)
- **Condition:** None - just checks bucket name
- **Use Case:** Customers viewing products on your storefront

```sql
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');
```

---

#### Policy: "Users can upload to their business folder"
- **Operation:** INSERT (upload)
- **Who:** Authenticated users only
- **Conditions:** 
  1. Bucket is `product-images`
  2. Upload path first folder matches a business the user owns
  3. User is authenticated

```sql
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
```

**How it validates:**
- `(storage.foldername(name))[1]` extracts the first folder name from the path
  - Example: path `"business-123/product-456.jpg"` → folder name `"business-123"`
- It queries the `businesses` table to check if:
  - A business with that ID exists
  - The current user (`auth.uid()`) is the owner

---

#### Policy: "Users can update their own product images"
- **Operation:** UPDATE (modify metadata, like renaming)
- **Who:** Authenticated users only
- **Conditions:** Same as INSERT - user must own the business

```sql
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
```

---

#### Policy: "Users can delete their own product images"
- **Operation:** DELETE (remove)
- **Who:** Authenticated users only
- **Conditions:** Same as INSERT/UPDATE - user must own the business

```sql
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
```

---

## Usage in Your Code

### Uploading Images (Already implemented in `lib/supabase/storage.ts`)

```typescript
import { uploadProductImage } from '@/lib/supabase/storage'

// In your component or API route:
const { url, error } = await uploadProductImage(
  supabase,           // Supabase client
  file,              // File object
  businessId,        // Business ID (becomes folder name)
  productId          // Optional: for naming the file
)

if (error) {
  console.error('Upload failed:', error)
} else {
  console.log('Image URL:', url)
  // url example: https://[project].supabase.co/storage/v1/object/public/product-images/business-123/456789.jpg
}
```

**What happens internally:**
1. File is validated (size < 5MB, type is image)
2. Path generated: `{businessId}/{timestamp}.{ext}`
3. Uploaded to `product-images` bucket
4. RLS policy checks user owns that businessId
5. If valid, image stored; if not, upload denied
6. Public URL returned for displaying the image

---

### Viewing Images (No Authentication Required)

```typescript
// Public URL format - works without login
const imageUrl = `https://[project-id].supabase.co/storage/v1/object/public/product-images/${businessId}/${filename}`

// Use in <img> tag
<img src={imageUrl} alt="Product" />

// Or via supabase client
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(`${businessId}/${filename}`)
```

---

### Deleting Images (Authenticated Only)

```typescript
import { deleteProductImage } from '@/lib/supabase/storage'

const { success, error } = await deleteProductImage(
  supabase,
  imageUrl  // Pass the full public URL
)

if (error) {
  console.error('Delete failed:', error)
} else {
  console.log('Image deleted successfully')
}
```

**What happens internally:**
1. Public URL parsed to extract the path
2. Delete request sent to `product-images` bucket
3. RLS policy checks:
   - User is authenticated
   - User owns the business folder where image lives
4. If valid, image deleted; if not, delete denied

---

### Listing Business Images

```typescript
import { listBusinessImages } from '@/lib/supabase/storage'

const { files, error } = await listBusinessImages(supabase, businessId)

if (error) {
  console.error('List failed:', error)
} else {
  console.log('Files:', files)
  // files = [
  //   { id: 'xxx', name: 'file1.jpg', ... },
  //   { id: 'yyy', name: 'file2.png', ... }
  // ]
}
```

---

## Security Matrix

| User Type | Bucket | SELECT | INSERT | UPDATE | DELETE |
|-----------|--------|--------|--------|--------|--------|
| **Anonymous** | product-images | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Authenticated (owns business)** | product-images | ✅ Yes | ✅ Yes* | ✅ Yes* | ✅ Yes* |
| **Authenticated (doesn't own)** | product-images | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Authenticated (admin)** | product-images | ✅ Yes | ✅ Yes* | ✅ Yes* | ✅ Yes* |

*Only to their own business folder

---

## Common Scenarios

### Scenario 1: User uploads image
1. User uploads file for business they own
2. RLS checks: Is user authenticated? ✅
3. RLS checks: Does user own that business? ✅
4. Upload succeeds → Image stored and URL returned

### Scenario 2: User tries to upload to someone else's business
1. User tries to upload to `other-business-123/image.jpg`
2. RLS checks: Is user authenticated? ✅
3. RLS checks: Does user own `other-business-123`? ❌
4. Upload fails → "Permission denied" error

### Scenario 3: Anonymous visitor views product
1. Visitor (not logged in) loads product page
2. Page shows image from `product-images/business-123/image.jpg`
3. RLS checks: Is SELECT allowed? ✅ (public can view)
4. Image loads successfully

### Scenario 4: User tries to delete image from another user's business
1. Authenticated user tries to delete
2. RLS checks: Is user authenticated? ✅
3. RLS checks: Does user own the business? ❌
4. Delete fails → "Permission denied" error

---

## Troubleshooting

### "Permission denied" on upload
**Check:**
- [ ] User is authenticated (logged in)
- [ ] User owns the business with that ID
- [ ] Path starts with correct businessId
- [ ] RLS policies are created and enabled

**Test:**
```sql
-- Check if your user owns a business
SELECT id FROM businesses WHERE owner_id = auth.uid();
-- If empty result, user doesn't own any business
```

### Bucket not found
- [ ] Bucket `product-images` exists
- [ ] Bucket visibility is set to **Public**
- [ ] Check bucket name spelling (no typos)

### Images not displaying
- [ ] RLS SELECT policy exists
- [ ] Policy allows `bucket_id = 'product-images'`
- [ ] Public URL format is correct
- [ ] Image file actually exists in bucket

### RLS policies not working
- [ ] RLS is **enabled** on storage.objects table
- [ ] Policies are created in correct order
- [ ] No syntax errors in policy SQL
- [ ] Disconnect and reconnect Supabase client after policy creation

---

## Testing RLS Policies

### Test 1: Anonymous can view images

```bash
# Should return 200 OK and image data
curl "https://[project].supabase.co/storage/v1/object/public/product-images/business-123/test.jpg"
```

### Test 2: Authenticated user can upload

```typescript
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('my-business/test.jpg', file)

// Should succeed if authenticated and own "my-business"
```

### Test 3: Authenticated user can delete own images

```typescript
const { error } = await supabase.storage
  .from('product-images')
  .remove(['my-business/test.jpg'])

// Should succeed if authenticated and own "my-business"
```

### Test 4: Cannot upload to other's business

```typescript
const { error } = await supabase.storage
  .from('product-images')
  .upload('someone-elses-business/test.jpg', file)

// Should fail with permission error
```

---

## File Structure Reference

Your implementation files:

```
lib/supabase/
├── client.ts           # Browser Supabase client
├── server.ts           # Server Supabase client
├── storage.ts          # Storage utility functions ← You'll use these
├── businesses.ts       # Business queries
└── middleware.ts       # Auth middleware

Functions in storage.ts:
- uploadProductImage()      # Upload with validation
- deleteProductImage()      # Delete by URL
- getSignedImageUrl()       # Get temporary signed URL
- listBusinessImages()      # List business folder
```

---

## Next Steps

1. ✅ Create `product-images` bucket (public)
2. ✅ Enable RLS on storage.objects
3. ✅ Run the SQL policies script
4. ✅ Test with your app using existing functions
5. 🎯 Integrate into product creation/update flows

All utility functions are already in `lib/supabase/storage.ts` - you're ready to go!
