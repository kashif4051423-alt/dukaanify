# Storage Setup - TL;DR

## 🚀 3-Minute Setup

### Step 1: Create Bucket
- Supabase Dashboard → Storage
- New Bucket: `product-images` (Public)
- ✅ Done

### Step 2: Enable RLS
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```
- ✅ Done

### Step 3: Create Policies
Copy-paste this entire block into Supabase SQL Editor:

```sql
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

CREATE POLICY "Public can view all images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Users can upload to their business folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  AND auth.role() = 'authenticated'
);
```
- ✅ Done

---

## 💻 Using in Your Code

### Upload
```typescript
import { uploadProductImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'

const { url, error } = await uploadProductImage(
  createClient(),
  file,
  businessId
)
```

### Display
```typescript
<img src={url} alt="Product" />
```

### Delete
```typescript
import { deleteProductImage } from '@/lib/supabase/storage'

await deleteProductImage(createClient(), url)
```

---

## 🔐 Security

| Who | What | Can? |
|-----|------|------|
| Public | View images | ✅ Yes |
| Authenticated | Upload own | ✅ Yes |
| Authenticated | Upload other | ❌ No |
| Authenticated | Delete own | ✅ Yes |
| Authenticated | Delete other | ❌ No |

---

## 📁 Path Format

```
product-images/{businessId}/{filename}
```

Example: `product-images/business-123/1704067200000.jpg`

Public URL: `https://[project].supabase.co/storage/v1/object/public/product-images/business-123/1704067200000.jpg`

---

## ✅ Verification

Test it works:
1. ✅ Login as business owner
2. ✅ Upload image → Should work
3. ✅ Logout → View page → Image displays
4. ✅ Delete image → Should work

---

## 📖 Full Docs

- **Setup**: `STORAGE_FINAL_SETUP.md`
- **Architecture**: `STORAGE_ARCHITECTURE.md`
- **Examples**: `STORAGE_USAGE_EXAMPLES.md`
- **Reference**: `QUICK_REFERENCE.md`
- **SQL**: `STORAGE_RLS_POLICIES.sql`

---

Done! 🎉
