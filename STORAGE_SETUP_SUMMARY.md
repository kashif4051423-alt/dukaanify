# Storage Setup Summary - Dukaanify

## What You Have

Your Dukaanify app already has image upload functionality implemented:

✅ **Supabase Storage utility functions** in `lib/supabase/storage.ts`:
- `uploadProductImage()` - Upload images with validation
- `deleteProductImage()` - Delete images by URL
- `getSignedImageUrl()` - Get temporary signed URLs
- `listBusinessImages()` - List business folder images

✅ **Browser/Server Supabase clients** ready to use

---

## What You Need to Set Up (3 Steps)

### Step 1: Create Bucket (5 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Storage**
3. Click **New Bucket**
4. Name: `product-images`
5. Visibility: **Public** (so customers can see images)
6. Click **Create**

### Step 2: Enable RLS (2 minutes)

Copy this into **Supabase SQL Editor** and run:

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Step 3: Create RLS Policies (2 minutes)

Copy the entire contents of **STORAGE_RLS_POLICIES.sql** into **SQL Editor** and run.

This creates 4 policies:
- ✅ Public can VIEW all images (no login needed)
- ✅ Authenticated users can UPLOAD to their business folder
- ✅ Authenticated users can UPDATE their own images
- ✅ Authenticated users can DELETE their own images

---

## Security Model

| Action | Public | Authenticated | Authenticated (other business) |
|--------|--------|---------------|--------|
| View images | ✅ Yes | ✅ Yes | ✅ Yes |
| Upload | ❌ No | ✅ Yes* | ❌ No |
| Update | ❌ No | ✅ Yes* | ❌ No |
| Delete | ❌ No | ✅ Yes* | ❌ No |

*Only to their own business folder

**Key:** Images are stored in paths like `{businessId}/image.jpg`. RLS policies check that users can only modify images in their own business folder.

---

## How It Works

### Upload Flow
```
User selects file
    ↓
Client validates (type, size)
    ↓
Upload to storage.product-images.{businessId}/{filename}
    ↓
RLS Policy checks:
  - Is bucket "product-images"? ✓
  - Is user authenticated? ✓
  - Does user own the businessId folder? ✓
    ↓
Upload succeeds → Public URL returned
```

### View Flow
```
Visitor (any user) opens product page
    ↓
Browser loads image from:
https://[project].supabase.co/storage/v1/object/public/product-images/business-123/image.jpg
    ↓
RLS Policy checks:
  - Is bucket "product-images"? ✓
    ↓
Image displays (no authentication required)
```

### Delete Flow
```
Business owner clicks delete image
    ↓
App calls deleteProductImage(url)
    ↓
Client sends DELETE request with path: business-123/image.jpg
    ↓
RLS Policy checks:
  - Is user authenticated? ✓
  - Does user own business-123? ✓
    ↓
Image deleted
```

---

## Using in Your App

### 1. Upload an Image

```typescript
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage'

const supabase = createClient()
const { url, error } = await uploadProductImage(
  supabase,
  file,        // File object
  businessId,  // Business ID (becomes folder)
  productId    // Optional: for file naming
)

if (url) {
  console.log('Image uploaded:', url)
  // Save url to database
}
```

### 2. Display an Image

```typescript
// No authentication needed
<img 
  src="https://[project].supabase.co/storage/v1/object/public/product-images/business-123/image.jpg"
  alt="Product"
/>
```

### 3. Delete an Image

```typescript
const { success, error } = await deleteProductImage(supabase, imageUrl)

if (success) {
  console.log('Image deleted')
} else {
  console.error('Delete failed:', error)
}
```

---

## Implementation Checklist

### Before Going Live
- [ ] Bucket "product-images" created and set to Public
- [ ] RLS enabled on storage.objects
- [ ] All 4 RLS policies created from STORAGE_RLS_POLICIES.sql
- [ ] Test upload as authenticated user (should succeed)
- [ ] Test view as public/visitor (should see image)
- [ ] Test delete attempt by another user (should fail)

### In Your Product Creation Form
- [ ] Add file input for product image
- [ ] Call `uploadProductImage()` on file select
- [ ] Save returned `url` to database when creating product
- [ ] Display error if upload fails

### In Your Product Display Page
- [ ] Load product from database (including image URL)
- [ ] Display image using public URL (no auth needed)
- [ ] Show delete button only to product owner

### In Your Admin/Dashboard
- [ ] Show products with images
- [ ] Allow owners to update product images
- [ ] Allow owners to delete product images

---

## Documentation Reference

For more details, see these files:

1. **STORAGE_SETUP_SUMMARY.md** (this file)
   - Quick overview and implementation checklist

2. **STORAGE_RLS_POLICIES.sql**
   - Ready-to-copy SQL policies script

3. **SUPABASE_STORAGE_SETUP.md**
   - Step-by-step setup instructions with policies explained

4. **STORAGE_IMPLEMENTATION_GUIDE.md**
   - Complete reference with security matrix and troubleshooting

5. **STORAGE_USAGE_EXAMPLES.md**
   - Real code examples for common use cases

---

## Testing the Setup

### Test 1: Public Can View Images
```bash
# This should work without authentication
curl "https://[project].supabase.co/storage/v1/object/public/product-images/test/image.jpg"
```

### Test 2: Authenticated User Can Upload
```typescript
const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
const { url, error } = await uploadProductImage(supabase, file, businessId)
console.log(url ? 'Upload succeeded' : 'Upload failed')
```

### Test 3: Authenticated User Cannot Upload to Other Business
```typescript
// This should fail with permission error
const { url, error } = await uploadProductImage(
  supabase, 
  file, 
  'someone-else-business'
)
console.log(error) // Should show permission denied
```

---

## Common Issues & Solutions

### "Bucket not found"
- Create bucket named `product-images` in Supabase Storage
- Make sure it's set to **Public** visibility

### "Permission denied" on upload
- Check user is authenticated (logged in)
- Check businessId matches a business the user owns
- Verify RLS policies are created

### Images not displaying
- Verify bucket is **Public** (not private)
- Check URL format is correct
- Verify SELECT RLS policy exists

### Cannot delete image
- Ensure user is authenticated
- Ensure user owns the business folder
- Check DELETE RLS policy exists

---

## Next Steps

1. ✅ Create `product-images` bucket
2. ✅ Run STORAGE_RLS_POLICIES.sql
3. 🎯 Integrate into product creation flow
4. 🎯 Add image upload UI to product form
5. 🎯 Test upload/delete as business owner
6. 🎯 Test view as public visitor

You're ready to go! The utility functions are already there, just need to set up the bucket and policies.
