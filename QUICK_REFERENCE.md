# Quick Reference - Storage Setup

## 3-Step Setup

### 1️⃣ Create Bucket
- Supabase Dashboard → Storage → New Bucket
- Name: `product-images`
- Visibility: **Public**

### 2️⃣ Enable RLS
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 3️⃣ Create Policies
See: `STORAGE_RLS_POLICIES.sql` (copy entire script to SQL Editor)

---

## RLS Policies (What They Do)

| Policy Name | Permission | Who | Condition |
|-------------|-----------|-----|-----------|
| Public can view all images | SELECT | Anyone | bucket_id = 'product-images' |
| Users can upload to their business folder | INSERT | Auth | Owns businessId folder |
| Users can update their own product images | UPDATE | Auth | Owns businessId folder |
| Users can delete their own product images | DELETE | Auth | Owns businessId folder |

---

## API Usage

### Upload
```typescript
import { uploadProductImage } from '@/lib/supabase/storage'

const { url, error } = await uploadProductImage(
  supabase, 
  file, 
  businessId, 
  productId
)
```

### Delete
```typescript
import { deleteProductImage } from '@/lib/supabase/storage'

const { success, error } = await deleteProductImage(supabase, imageUrl)
```

### List
```typescript
import { listBusinessImages } from '@/lib/supabase/storage'

const { files, error } = await listBusinessImages(supabase, businessId)
```

### View
```typescript
// Public URL - no auth needed
https://[project].supabase.co/storage/v1/object/public/product-images/{businessId}/{filename}
```

---

## Path Structure
```
product-images/
├── business-id-1/
│   ├── product-1-timestamp.jpg
│   ├── product-2-timestamp.png
│   └── timestamp.jpg
├── business-id-2/
│   ├── product-x-timestamp.jpg
│   └── product-y-timestamp.jpg
```

**Important:** First folder must match businessId user owns (enforced by RLS)

---

## Error Handling

### Upload Errors
- "Permission denied" → User doesn't own business folder
- "File must be under 5MB" → File too large
- "Only JPEG, PNG, WebP, and GIF allowed" → Invalid file type
- "Bucket not found" → Create bucket first

### Delete Errors
- "Permission denied" → User doesn't own the image
- "Invalid image URL format" → URL is malformed

---

## Files to Review

| File | Purpose |
|------|---------|
| `lib/supabase/storage.ts` | Utility functions (already implemented) |
| `STORAGE_RLS_POLICIES.sql` | Copy-paste SQL for policies |
| `STORAGE_SETUP_SUMMARY.md` | Quick overview |
| `STORAGE_IMPLEMENTATION_GUIDE.md` | Detailed guide |
| `STORAGE_USAGE_EXAMPLES.md` | Code examples |

---

## Verification

✅ All set when:
- [ ] Bucket exists and is Public
- [ ] RLS enabled on storage.objects
- [ ] 4 policies created
- [ ] Can upload to own business folder
- [ ] Cannot upload to other's business folder
- [ ] Public can view images
- [ ] Can delete own images

---

## Quick Test

```typescript
// Test upload
const { url, error } = await uploadProductImage(supabase, file, businessId)

// Test delete (if upload worked)
const { success } = await deleteProductImage(supabase, url)

// Test public view (no auth needed)
<img src={url} />  // Should display if upload succeeded
```

---

## Cheat Sheet

| Need | Function | File |
|------|----------|------|
| Upload image | `uploadProductImage()` | lib/supabase/storage.ts |
| Delete image | `deleteProductImage()` | lib/supabase/storage.ts |
| List images | `listBusinessImages()` | lib/supabase/storage.ts |
| Signed URL | `getSignedImageUrl()` | lib/supabase/storage.ts |
| Client | `createClient()` | lib/supabase/client.ts |
| Server client | `createClient()` | lib/supabase/server.ts |

---

## SQL Copy-Paste

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- DROP policies (optional)
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- CREATE policies (copy from STORAGE_RLS_POLICIES.sql)
```

See `STORAGE_RLS_POLICIES.sql` for the complete policies SQL.

---

## Flow Diagram

```
┌─────────────────────────────────────────┐
│         User Uploads Image              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  uploadProductImage(supabase, file...)  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Validate: Type, Size, Format          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Generate path: {businessId}/{name}    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Upload to product-images bucket        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  RLS Policy checks:                     │
│  ✓ Bucket = product-images?             │
│  ✓ User authenticated?                  │
│  ✓ User owns businessId folder?         │
└─────────────────────────────────────────┘
                  ↓
       ┌─────────┴─────────┐
       ↓                   ↓
    ✅ ALLOWED       ❌ DENIED
  (return URL)    (return error)
```

---

## Remember

- 🔐 **Security:** RLS ensures users only access their own business folder
- 🌍 **Public URLs:** Images stored with public visibility, no auth needed to view
- 📁 **Folder Structure:** `{businessId}/{filename}` - first folder is always businessId
- 🛡️ **Multi-tenant:** Each business isolated in its own folder by policy
- ⚡ **Performance:** Public images can be cached and viewed without hitting auth
