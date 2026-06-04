# ✅ FINAL STORAGE SETUP CHECKLIST - DUKAANIFY

Your app is **ready to go**. Just follow these 3 steps.

---

## STATUS: Everything is Already Built ✅

Your Dukaanify codebase includes:

✅ **Supabase storage utility functions** (lib/supabase/storage.ts)
- `uploadProductImage()` - Upload with validation
- `deleteProductImage()` - Delete by URL  
- `listBusinessImages()` - List business images
- `getSignedImageUrl()` - Temporary URLs

✅ **Server & client setup** (lib/supabase/client.ts + server.ts)

✅ **Body size config** (next.config.ts - 10MB limit)

You only need to:
1. Create the bucket
2. Enable RLS
3. Create the policies

---

## Step 1: Create Bucket (1 minute)

Go to **Supabase Dashboard** → **Storage**

1. Click **New Bucket**
2. Name: `product-images`
3. Visibility: **Public** ⚠️ (Important!)
4. Click **Create**

Done! ✓

---

## Step 2: Enable RLS (30 seconds)

Go to **Supabase Dashboard** → **SQL Editor**

Copy & run this single command:

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

Done! ✓

---

## Step 3: Create RLS Policies (2 minutes)

In **Supabase SQL Editor**, copy this entire script and run:

```sql
-- Drop existing policies (safe if they don't exist)
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- POLICY 1: Anyone can VIEW images
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- POLICY 2: Only authenticated users can UPLOAD to their business folder
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

-- POLICY 3: Only authenticated users can UPDATE their own images
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

-- POLICY 4: Only authenticated users can DELETE their own images
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

Done! ✓

---

## That's It! You're Live 🎉

Your app can now:

✅ **Upload images** - Business owners upload product images
✅ **Display images** - Customers view images without logging in
✅ **Delete images** - Business owners delete their own images
✅ **Multi-tenant** - Each business isolated in own folder
✅ **Secure** - RLS policies enforce access control

---

## Quick Test

### Test 1: Create a Product with Image
1. Login as business owner
2. Go to create product
3. Upload an image
4. Submit
5. Image should appear ✓

### Test 2: View as Customer
1. Logout or open private browser
2. View product
3. Image should display ✓

### Test 3: Try Deleting
1. Login as owner
2. Delete product
3. Image should be gone ✓

---

## How It Works

### Upload Path
```
product-images/
└── {businessId}/
    └── {timestamp}.{ext}
```

Example: `product-images/business-123/1704067200000.jpg`

### Public URL
```
https://[your-project].supabase.co/storage/v1/object/public/product-images/{businessId}/image.jpg
```

Example: `https://abc123.supabase.co/storage/v1/object/public/product-images/business-123/1704067200000.jpg`

### Security
- **Public SELECT** - Anyone can view (storefront)
- **Authenticated INSERT** - Only logged-in users can upload
- **To Their Folder** - Users can only upload to their businessId folder
- **Delete Own Only** - Users can only delete images from their folder

---

## Troubleshooting

### "Bucket not found"
→ Create `product-images` bucket and set to **Public**

### "Permission denied" on upload
→ Check user owns the business
→ Verify RLS policies are created
→ Make sure user is logged in

### Images not displaying
→ Bucket must be **Public**
→ Check public URL format
→ Verify SELECT policy exists

### Cannot delete image
→ Must be logged in
→ Must own the business folder
→ DELETE policy must exist

---

## Documentation Files

For reference later:

| File | Content |
|------|---------|
| `STORAGE_README.md` | Overview of setup |
| `STORAGE_ARCHITECTURE.md` | System diagrams & flows |
| `STORAGE_IMPLEMENTATION_GUIDE.md` | Detailed security & implementation |
| `STORAGE_USAGE_EXAMPLES.md` | Code examples |
| `STORAGE_RLS_POLICIES.sql` | SQL policies script |
| `QUICK_REFERENCE.md` | Quick lookup |
| `STORAGE_SETUP_SUMMARY.md` | Step-by-step guide |

---

## Code Reference

### Upload in Your Component
```typescript
import { uploadProductImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { url, error } = await uploadProductImage(
  supabase,
  file,
  businessId
)
```

### Display Image
```typescript
<img src={url} alt="Product" />
// URL works for anyone (no login needed)
```

### Delete Image
```typescript
import { deleteProductImage } from '@/lib/supabase/storage'

const { success, error } = await deleteProductImage(supabase, url)
```

---

## Next Steps

- [ ] Create `product-images` bucket
- [ ] Enable RLS on storage.objects
- [ ] Create 4 RLS policies
- [ ] Test upload as business owner
- [ ] Test view as customer
- [ ] Integrate into product flow
- [ ] Deploy to production
- [ ] Monitor storage usage

---

## You're All Set! 🚀

Everything is built and ready. Just run the SQL above and you're live with image uploads!

Questions? Check the documentation files above or review:
- `lib/supabase/storage.ts` - All utility functions
- `STORAGE_ARCHITECTURE.md` - System design
- `STORAGE_USAGE_EXAMPLES.md` - Code examples
