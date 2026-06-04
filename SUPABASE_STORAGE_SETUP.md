# Supabase Storage Setup for Dukaanify

This guide sets up image storage for multi-tenant product uploads with proper RLS policies.

## Step 1: Create Storage Bucket

Go to **Supabase Dashboard → Storage** and create a new bucket:

- **Bucket name:** `product-images`
- **Visibility:** Public (to allow customers to view product images)

---

## Step 2: Storage RLS Policies

Apply these policies in **Supabase Dashboard → Storage → Policies** tab for the `product-images` bucket.

### Policy 1: Authenticated Users Can Upload to Their Business Folder

**Policy Type:** INSERT

```sql
-- Allow authenticated users to upload images to their own business folder
-- Path format: {businessId}/{filename}

CREATE POLICY "Users can upload to their business folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = (
    SELECT business_id FROM products
    WHERE owner_id = auth.uid()
    LIMIT 1
  )
  AND auth.role() = 'authenticated'
);
```

**Alternative (Simpler - if you store businessId in auth metadata):**

```sql
CREATE POLICY "Users can upload to their business folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'business_id'
  AND auth.role() = 'authenticated'
);
```

---

### Policy 2: Public Can View All Images (SELECT)

```sql
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');
```

---

### Policy 3: Authenticated Users Can Update Their Own Images

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

### Policy 4: Authenticated Users Can Delete Their Own Images

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

## Step 3: How Your Current Code Works

Your `product.ts` already implements this correctly:

```typescript
// Upload path: {businessId}/{timestamp}.{ext}
const { url, error: imgError } = await uploadImage(
  supabase, imageFile, `${businessId}/${Date.now()}.${ext}`
)
```

The RLS policies check that:
1. User is authenticated
2. Their businessId folder matches the upload path
3. Only they can modify/delete their own images

---

## Step 4: Testing the Setup

### Test Upload (Authenticated):
```typescript
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${businessId}/${Date.now()}.jpg`, file)

// Should succeed if user owns businessId
```

### Test View (Public):
```
https://[project-id].supabase.co/storage/v1/object/public/product-images/{businessId}/image.jpg
```

This should be accessible without authentication ✓

### Test Delete (Must Own):
```typescript
const { error } = await supabase.storage
  .from('product-images')
  .remove([`${businessId}/image.jpg`])

// Only succeeds if user owns that businessId
```

---

## SQL: Complete Setup (For Supabase SQL Editor)

Run these exact commands in **Supabase Dashboard → SQL Editor** in this order:

### 1. Enable RLS on storage.objects
```sql
-- Ensure RLS is enabled on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 2. Drop existing policies (if any)
```sql
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;
```

### 3. Create the 4 RLS Policies

```sql
-- POLICY 1: Public SELECT - Anyone can view images
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- POLICY 2: Authenticated INSERT - Users can upload to their business folder
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

-- POLICY 3: Authenticated UPDATE - Users can modify their own images
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

-- POLICY 4: Authenticated DELETE - Users can delete their own images
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

### How It Works

| Operation | Who Can? | Condition |
|-----------|----------|-----------|
| **SELECT** | Public (no auth) | ✅ Anyone can view all images |
| **INSERT** | Authenticated users | ✅ Can upload to their own business folder |
| **UPDATE** | Authenticated users | ✅ Can modify images in their own business folder |
| **DELETE** | Authenticated users | ✅ Can delete images from their own business folder |

**RLS Logic:** The path structure `{businessId}/{filename}` is validated against the `businesses` table. The first folder name (extracted via `storage.foldername(name)[1]`) must match a business ID owned by the authenticated user.

---

## Verification Checklist

- [ ] Bucket "product-images" exists and is **Public**
- [ ] RLS is **enabled** on storage.objects
- [ ] All 4 policies created (SELECT, INSERT, UPDATE, DELETE)
- [ ] Image uploads path: `{businessId}/{filename}`
- [ ] Users can only upload to their own business folder
- [ ] Public can view all images (no auth required)
- [ ] Users can only delete their own images

---

## Documentation Files

See the following files in this repository for complete information:

- **STORAGE_RLS_POLICIES.sql** - Copy-paste ready SQL script for all RLS policies
- **STORAGE_IMPLEMENTATION_GUIDE.md** - Comprehensive guide with security matrix and scenarios
- **STORAGE_USAGE_EXAMPLES.md** - Real-world code examples for your app

---

## Troubleshooting

**Error: "Permission denied" on upload**
- Check if bucket exists and is public
- Verify user is authenticated
- Check RLS policies are enabled
- Ensure upload path starts with businessId user owns

**Error: "Bucket not found"**
- Create the bucket named `product-images`
- Make it PUBLIC visibility

**Images not displaying**
- Use public URL: `https://[project-id].supabase.co/storage/v1/object/public/product-images/{businessId}/image.jpg`
- Verify RLS SELECT policy exists and allows public access

---

## Your Current Implementation ✓

Your code in `product.ts` already:
- ✅ Uploads to `{businessId}/{filename}` path
- ✅ Only authenticated users can upload
- ✅ Each business isolated in own folder
- ✅ Handles image URLs correctly

Just ensure the RLS policies above are configured in your Supabase project!
