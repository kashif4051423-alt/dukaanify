# Supabase Storage Quick Reference - Dukaanify

## Setup Checklist

### 1. Supabase Dashboard Setup
- [ ] Go to **Storage** tab
- [ ] Click **Create bucket**
  - Name: `product-images`
  - Visibility: **Public**
- [ ] Go to **RLS Policies** tab
- [ ] Apply policies from `SUPABASE_STORAGE_SETUP.md`

### 2. Your Code Already Has
- ✅ Image upload in `lib/actions/product.ts`
- ✅ Storage helpers in `lib/supabase/storage.ts`
- ✅ Client setup in `lib/supabase/server.ts`

---

## Using Storage in Your App

### Upload Image (In Server Action)

```typescript
import { uploadProductImage } from '@/lib/supabase/storage'

const { url, error } = await uploadProductImage(
  supabase,
  imageFile,
  businessId,
  productId // optional
)

if (error) {
  return { fieldErrors: { image: `Upload failed: ${error}` } }
}

// Use url in database
await supabase.from('products').insert({
  image_url: url,
  // ... other fields
})
```

### Display Image (Client Component)

```typescript
import Image from 'next/image'

export function ProductImage({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) {
    return <div className="bg-gray-200 rounded">No image</div>
  }

  return (
    <Image
      src={imageUrl}
      alt="Product"
      width={400}
      height={400}
      // Image is already public, no auth needed
    />
  )
}
```

### Delete Image (In Server Action)

```typescript
import { deleteProductImage } from '@/lib/supabase/storage'

const { success, error } = await deleteProductImage(supabase, product.image_url)

if (error) {
  return { error: `Delete failed: ${error}` }
}
```

### List All Business Images

```typescript
import { listBusinessImages } from '@/lib/supabase/storage'

const { files, error } = await listBusinessImages(supabase, businessId)

if (error) {
  console.error('Failed to list images:', error)
  return
}

files?.forEach(file => {
  console.log('File:', file.name)
})
```

---

## File Structure

Your uploads will be organized like this:

```
product-images/
├── business-123/
│   ├── 1704067200000.jpg      (auto-generated)
│   ├── product-456-1704067200.png
│   └── product-789-1704067201.jpg
├── business-456/
│   └── 1704067202000.jpg
└── business-789/
    └── 1704067203000.jpg
```

**Benefits:**
- ✅ Clean organization by business
- ✅ Easy to list all images per business
- ✅ RLS policies automatically isolate by folder
- ✅ Fast deletion of all business images if needed

---

## Public Image URLs

Once uploaded, images are accessible at:

```
https://[project-id].supabase.co/storage/v1/object/public/product-images/{businessId}/{filename}
```

Example:
```
https://abc123def456.supabase.co/storage/v1/object/public/product-images/business-123/1704067200000.jpg
```

**No authentication needed** — customers can view these directly!

---

## Security Summary

| Action | Who | Allowed |
|--------|-----|---------|
| Upload | Authenticated user | ✅ To their own business folder only |
| View | Anyone | ✅ Public (no auth needed) |
| Update | Authenticated user | ✅ Their own business images only |
| Delete | Authenticated user | ✅ Their own business images only |
| List | Authenticated user | ✅ Via API (RLS enforced) |

---

## Troubleshooting

### Images Not Uploading
1. Check bucket exists: `product-images`
2. Check bucket is PUBLIC
3. Check RLS policies exist
4. Check user is authenticated
5. Check businessId is correct

### Images Not Displaying
1. Verify public URL format
2. Check RLS SELECT policy allows public access
3. Test URL directly in browser (should load without auth)
4. Check CloudFlare/CDN caching

### Users Seeing Each Other's Images
1. Verify RLS policies are enabled
2. Check path starts with businessId
3. Verify businessId ownership in database

### Permission Denied on Delete
1. Check DELETE policy exists
2. Verify user owns the businessId
3. Check path format: `{businessId}/{filename}`

---

## Environment Variables Needed

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The first two are already in your code ✓

---

## Next Steps

1. ✅ Create bucket and RLS policies (from `SUPABASE_STORAGE_SETUP.md`)
2. ✅ Test upload in your app
3. ✅ Verify images display correctly
4. ✅ Test delete functionality
5. ✅ Verify users can't access other business images

**You're ready to go!** Your code already implements this correctly. Just set up the bucket and policies in Supabase. 🚀
