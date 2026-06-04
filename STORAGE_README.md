# Supabase Storage Setup for Dukaanify 🚀

Complete guide to setting up image uploads with multi-tenant isolation and RLS policies.

## Quick Start

### What You Need to Do

1. **Create Storage Bucket** in Supabase Dashboard
   - Name: `product-images`
   - Visibility: Public
   - Takes 1 minute

2. **Add RLS Policies** from `STORAGE_SQL_SETUP.sql`
   - Copy 4 SQL policies
   - Paste in Supabase SQL Editor
   - Takes 2 minutes

3. **Test in Your App**
   - Create product with image
   - Should work immediately ✓

That's it! Your app code is already complete.

---

## What's Already Done ✅

Your codebase already includes:

- **Product upload action** (`lib/actions/product.ts`)
  - Validates file type & size
  - Uploads to storage
  - Saves URL to database

- **Storage helpers** (`lib/supabase/storage.ts`)
  - `uploadProductImage()` - Upload with validation
  - `deleteProductImage()` - Delete with path extraction
  - `listBusinessImages()` - List all business images
  - `getSignedImageUrl()` - Temporary access links

- **Server client** (`lib/supabase/server.ts`)
  - Authentication context
  - Secure credentials

- **Config** (`next.config.ts`)
  - serverActions.bodySizeLimit: 10mb ✓
  - Image optimization ✓

---

## What You Need to Set Up 📋

### Step 1: Create Bucket
```
Supabase Dashboard
  → Storage
  → Create bucket
  → Name: product-images
  → Visibility: Public
  → Create
```

### Step 2: Add RLS Policies
```
Supabase Dashboard
  → SQL Editor
  → Paste STORAGE_SQL_SETUP.sql
  → Run
```

Or use the Policies UI in Storage tab.

### Step 3: Test Upload
```
1. Create a product
2. Upload an image
3. Verify it displays ✓
```

---

## File Organization

```
Your project includes:

📄 STORAGE_README.md (this file)
   └─ Overview & quick start

📄 SUPABASE_STORAGE_SETUP.md
   └─ Detailed setup instructions
   └─ Explanation of each policy
   └─ Troubleshooting guide

📄 STORAGE_SQL_SETUP.sql
   └─ Copy-paste SQL policies
   └─ Verification queries
   └─ Cleanup scripts

📄 STORAGE_QUICK_REFERENCE.md
   └─ How to use in your app
   └─ Code examples
   └─ File structure

📄 STORAGE_ARCHITECTURE.md
   └─ System diagrams
   └─ Data flow visualization
   └─ Security analysis
   └─ Multi-tenant isolation explanation

📄 IMPLEMENTATION_CHECKLIST.md
   └─ Step-by-step checklist
   └─ Testing procedures
   └─ Verification steps

📁 lib/supabase/storage.ts
   └─ Helper functions
   └─ Upload, delete, list images
```

---

## How It Works

### User Uploads Image
```
1. User selects image in ProductForm
2. Server action: createProduct()
3. uploadProductImage() uploads to storage
4. Path: {businessId}/timestamp.jpg
5. RLS policy checks:
   ✓ User is authenticated
   ✓ Path is in their business folder
   ✓ They own that business
6. Image stored & URL saved to database
```

### Customer Views Image
```
1. Product displays with <Image src={image_url} />
2. Browser requests image from public URL
3. RLS SELECT policy allows public access
4. No authentication needed
5. Image displays ✓
```

### User Deletes Image
```
1. User deletes product
2. deleteProductImage() called
3. Extracts path from URL
4. RLS policy checks:
   ✓ User is authenticated
   ✓ Path is in their business folder
   ✓ They own that business
5. Image deleted ✓
```

---

## Security Features

| Feature | Benefit |
|---------|---------|
| Path-based isolation | Each business folder separate |
| RLS policies | Enforce permissions at storage level |
| Ownership check | Users can only modify own images |
| Public viewing | Customers see images without auth |
| No direct access | Access only through app or public URL |

---

## Example Scenarios

### Scenario A: User A Creates Product
```
User A uploads image → stored at /business-a-id/image1.jpg
                       ↓
                       URL saved in products table
                       ↓
                       Product displays with image ✓
```

### Scenario B: Customer Views Product
```
Customer visits store → sees product card
                       ↓
                       <Image src="https://storage.../business-a-id/image1.jpg" />
                       ↓
                       RLS allows public view ✓
```

### Scenario C: User B Tries to Upload to User A's Folder
```
User B tries: storage.upload('business-a-id/image.jpg')
              ↓
              RLS checks: Does user B own business-a-id?
              ↓
              NO → Permission denied ✗
```

---

## Common Issues & Fixes

### Images Not Uploading
```
❌ Error: "Bucket not found"
✅ Fix: Create product-images bucket in Supabase

❌ Error: "Permission denied"
✅ Fix: Check RLS policies are applied

❌ Error: "Body exceeded 1 MB"
✅ Fix: next.config.ts already has serverActions.bodySizeLimit: '10mb'
```

### Images Not Displaying
```
❌ Image URL not working
✅ Fix: Verify bucket is PUBLIC

❌ "Access Denied" when viewing
✅ Fix: RLS SELECT policy allows public access automatically
```

### File Size Issues
```
❌ Upload fails for 5MB file
✅ Fix: ProductForm validates max 5MB (you can increase if needed)

❌ Upload fails for 10MB file
✅ Fix: next.config.ts allows up to 10MB server action body
```

---

## Testing Checklist

- [ ] Create `product-images` bucket
- [ ] Run SQL policies
- [ ] Login & create product with image
- [ ] Image uploads without error
- [ ] Image URL appears in database
- [ ] Image displays on product page
- [ ] Open image URL in incognito (no auth) → displays ✓
- [ ] Delete product → image deleted ✓
- [ ] Create another user → can't access first user's images ✓

---

## Environment Variables

Your app already has these in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

No additional setup needed! ✓

---

## Next Steps

1. ✅ Read this file
2. ✅ Follow SUPABASE_STORAGE_SETUP.md for detailed instructions
3. ✅ Copy policies from STORAGE_SQL_SETUP.sql
4. ✅ Run checklist from IMPLEMENTATION_CHECKLIST.md
5. ✅ Test in your app
6. ✅ Reference STORAGE_QUICK_REFERENCE.md for usage

---

## Questions?

### How do I...

**...upload an image?**
→ See `STORAGE_QUICK_REFERENCE.md` - Using Storage in Your App

**...delete an image?**
→ See `lib/supabase/storage.ts` - `deleteProductImage()` function

**...understand RLS policies?**
→ See `STORAGE_ARCHITECTURE.md` - Multi-Tenant Isolation section

**...list all images for a business?**
→ See `lib/supabase/storage.ts` - `listBusinessImages()` function

**...allow temporary access to images?**
→ See `lib/supabase/storage.ts` - `getSignedImageUrl()` function

**...optimize uploaded images?**
→ See `STORAGE_ARCHITECTURE.md` - Future Enhancements section

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Your Next.js App                       │
├─────────────────────────────────────────┤
│ ProductForm                             │
│   ↓                                     │
│ Server Action (product.ts)              │
│   ↓                                     │
│ uploadProductImage (storage.ts)         │
│   ↓                                     │
│ Supabase Storage API                    │
│   ↓                                     │
│ RLS Policies (4 policies)               │
│   ├─ SELECT: Public view ✓              │
│   ├─ INSERT: Auth upload ✓              │
│   ├─ UPDATE: Auth modify ✓              │
│   └─ DELETE: Auth delete ✓              │
│   ↓                                     │
│ product-images/{businessId}/file.jpg    │
└─────────────────────────────────────────┘
```

---

## Production Checklist

- [ ] Bucket created and public
- [ ] RLS policies applied
- [ ] Image compression enabled (optional)
- [ ] CDN caching configured (optional)
- [ ] Backup strategy in place
- [ ] Monitoring/logging setup
- [ ] Tested with realistic file sizes
- [ ] Tested with multiple users
- [ ] Tested cross-tenant isolation

---

## Support

For help with:
- **Setup issues** → See SUPABASE_STORAGE_SETUP.md
- **SQL policies** → See STORAGE_SQL_SETUP.sql
- **Code usage** → See STORAGE_QUICK_REFERENCE.md
- **Architecture** → See STORAGE_ARCHITECTURE.md
- **Implementation** → See IMPLEMENTATION_CHECKLIST.md

Your app is ready for production! 🎉
