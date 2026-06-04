# Supabase Storage Implementation Checklist

## ✅ Your App Code (Already Complete)

- ✅ `lib/actions/product.ts` - Handles image uploads in createProduct/updateProduct
- ✅ `lib/supabase/storage.ts` - Helper functions for upload/delete/list
- ✅ `lib/supabase/server.ts` - Supabase client configuration
- ✅ `next.config.ts` - serverActions.bodySizeLimit: '10mb' (configured)
- ✅ ProductForm - Image input and preview

## 📋 Your Supabase Setup (Need to Complete)

### Step 1: Create Storage Bucket
- [ ] Go to **Supabase Dashboard**
- [ ] Click **Storage** in the left sidebar
- [ ] Click **Create bucket**
- [ ] Name: `product-images`
- [ ] Visibility: **Public** (important!)
- [ ] Click **Create**

### Step 2: Enable RLS Policies
- [ ] In **Storage tab**, click `product-images` bucket
- [ ] Click **Policies** tab
- [ ] Copy policies from `STORAGE_SQL_SETUP.sql`
- [ ] Paste into **Supabase SQL Editor**
- [ ] Run all 4 CREATE POLICY statements

OR use the Policies UI:
- [ ] Click **New Policy** → **SELECT**
  - Add: `USING (bucket_id = 'product-images')`
- [ ] Click **New Policy** → **INSERT**
  - Add complex condition from SQL file
- [ ] Click **New Policy** → **UPDATE**
  - Add complex condition from SQL file
- [ ] Click **New Policy** → **DELETE**
  - Add complex condition from SQL file

### Step 3: Verify Environment Variables
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🧪 Testing

### Test 1: Upload Image
- [ ] Login as user A
- [ ] Create a new product with image
- [ ] Check: Image uploads without error ✓
- [ ] Check: Image URL appears in product (e.g., `https://[project].supabase.co/storage/v1/object/public/product-images/business-id/timestamp.jpg`)
- [ ] Check: Image displays in product card ✓

### Test 2: View Image as Public
- [ ] Copy the image URL
- [ ] Open URL in **incognito/private browsing** (no auth)
- [ ] Check: Image displays ✓ (no login required)

### Test 3: Delete Image
- [ ] Login as user A
- [ ] Delete a product with image
- [ ] Check: Image is deleted from storage ✓

### Test 4: Cross-Tenant Isolation
- [ ] User A uploads image to business-A
- [ ] User B tries to upload to business-A folder (shouldn't work)
- [ ] User B can only upload to their own business folder ✓
- [ ] User B cannot see User A's images in storage (but can view public URLs)

### Test 5: Edit Product
- [ ] Login as user A
- [ ] Edit existing product
- [ ] Upload new image
- [ ] Check: New image appears ✓
- [ ] Check: Old image replaced ✓

## 🔍 Verification

### Check Bucket Exists
In **Supabase Dashboard → Storage**:
- [ ] See `product-images` bucket
- [ ] Bucket is marked as **Public**

### Check RLS Policies
In **Supabase Dashboard → Storage → product-images → Policies**:
- [ ] See 4 policies listed:
  - `Public can view all images` (SELECT)
  - `Users can upload to their business folder` (INSERT)
  - `Users can update their own product images` (UPDATE)
  - `Users can delete their own product images` (DELETE)

### Check SQL Editor
In **Supabase Dashboard → SQL Editor**, run:
```sql
SELECT policyname, permissive, roles
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
```
- [ ] Should see 4 rows (4 policies)

## 📱 File Size Limits

Your app currently allows:
- Input validation: 5MB max (in ProductForm.tsx)
- Server action: 10MB max (in next.config.ts)
- RLS: No size restriction

**Recommended:** Keep 5MB limit for better UX

## 🐛 Common Issues & Fixes

### Issue: "Bucket not found"
**Fix:** Create `product-images` bucket in Supabase Dashboard

### Issue: "Permission denied" on upload
**Fix:** 
1. Check RLS policies exist
2. Verify user is authenticated
3. Check businessId is correct
4. Check user owns that businessId

### Issue: Images not displaying
**Fix:**
1. Check bucket is PUBLIC
2. Check image URL format is correct
3. Test URL in browser (no auth needed)
4. Check RLS SELECT policy exists

### Issue: User A can see User B's images
**Fix:** This is OK! Images are public. The RLS policies prevent unauthorized deletion/modification only.

### Issue: "Body exceeded 1 MB limit"
**Fix:** Increase `serverActions.bodySizeLimit` in next.config.ts to '10mb' (already done ✓)

## 📚 Files Created for Reference

- `SUPABASE_STORAGE_SETUP.md` - Complete setup guide
- `STORAGE_SQL_SETUP.sql` - Copy-paste SQL policies
- `STORAGE_QUICK_REFERENCE.md` - Quick usage guide
- `IMPLEMENTATION_CHECKLIST.md` - This file
- `lib/supabase/storage.ts` - Helper functions

## ✨ You're Ready!

Once you complete the Supabase setup checklist above:

1. ✅ Users can upload product images
2. ✅ Customers can view all images (public)
3. ✅ Users can only modify their own business images
4. ✅ Multi-tenant isolation is enforced
5. ✅ No single business can access another's images

**Next:** Test the implementation and verify all checks pass! 🚀
