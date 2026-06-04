# Image Upload Debugging Guide

Complete troubleshooting guide for Supabase Storage upload issues in Dukaanify.

---

## Common Errors & Solutions

### Error: "Bucket not found"

**Cause:** The `product-images` bucket doesn't exist in Supabase

**Solution:**
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `product-images`
4. Visibility: **Public** ✓
5. Click Create

---

### Error: "Permission denied" or "new row violates row-level security policy"

**Cause:** RLS policies not configured correctly

**Solution:**

#### Check RLS is Enabled
```sql
-- Run in Supabase SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
-- Should show: rowsecurity = true
```

#### Verify Policies Exist
```sql
-- Run in Supabase SQL Editor
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
-- Should show 4 policies: SELECT, INSERT, UPDATE, DELETE
```

#### Create Missing Policies
If policies are missing, run this complete script:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing (if any)
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- CREATE: Public can view
CREATE POLICY "Public can view all images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- CREATE: Authenticated can upload to their folder
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

-- CREATE: Authenticated can update their images
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

-- CREATE: Authenticated can delete their images
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

### Error: "Invalid file type" or "File size exceeds"

**Cause:** Validation errors from uploadImage.ts

**Solution:** Check these constraints:
- File type: Must be jpg, png, or webp
- File size: Must be under 2MB

**Fix in code:**
```typescript
// In lib/uploadImage.ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

// To change limits, edit these constants
```

---

### Error: "User not authenticated" or "No user session"

**Cause:** User not logged in

**Solution:**
```typescript
// Check if user is authenticated
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  console.error('User not authenticated')
  // Redirect to login
}
```

---

### Error: "Invalid store ID" or "Business not found"

**Cause:** storeId/businessId doesn't exist or user doesn't own it

**Solution:**
```sql
-- Verify business exists and user owns it
SELECT id, owner_id, name 
FROM businesses 
WHERE id = 'your-business-id' 
AND owner_id = auth.uid();
-- Should return a row
```

**Check in code:**
```typescript
// Before uploading, verify businessId
const { data: business } = await supabase
  .from('businesses')
  .select('id')
  .eq('id', businessId)
  .eq('owner_id', user.id)
  .single()

if (!business) {
  console.error('Business not found or access denied')
}
```

---

### Error: "CORS policy error"

**Cause:** CORS configuration issue

**Solution:**
1. Check CORS in Supabase Dashboard
2. Settings → API → CORS allowed origins
3. Add your domain (e.g., `http://localhost:3000` for dev)

**Temporary fix for development:**
```typescript
// In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}
```

---

### Error: "Upload failed: [network error]"

**Cause:** Network connectivity or Supabase service issue

**Solution:**
1. Check internet connection
2. Verify Supabase project is active
3. Check Supabase status page
4. Try uploading smaller file

---

## Debugging Checklist

### 1. Check Supabase Client

**In browser console:**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Has anon key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Test connection
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data, error)
```

**Expected output:**
```
Supabase URL: https://[project].supabase.co
Has anon key: true
Session: { session: {...} }
```

---

### 2. Check Environment Variables

**File: `.env.local`**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Verify in code:**
```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

**Important:**
- Must start with `NEXT_PUBLIC_` for client-side
- Restart dev server after changing `.env.local`

---

### 3. Check Bucket Configuration

**In Supabase Dashboard:**
1. Go to Storage
2. Find `product-images` bucket
3. Click settings icon
4. Verify:
   - ✓ Public bucket (yes)
   - ✓ File size limit (50MB default)
   - ✓ Allowed MIME types (all or image/*)

---

### 4. Check File Path Format

**Valid path format:**
```
{storeId}/{filename}
```

**Examples:**
```
business-123/1704067200000-abc123.jpg   ✓ Valid
store-456/product.png                   ✓ Valid
image.jpg                               ✗ Invalid (no storeId folder)
business-123//image.jpg                 ✗ Invalid (double slash)
```

**Check in uploadImage.ts:**
```typescript
// The path should be:
const filePath = `${storeId}/${fileName}`

// NOT:
const filePath = `${fileName}` // Missing storeId
const filePath = `/${storeId}/${fileName}` // Leading slash
```

---

### 5. Test Upload Manually

**In browser console:**
```typescript
import { uploadProductImage } from '@/lib/uploadImage'

// Create test file
const blob = new Blob(['test'], { type: 'image/jpeg' })
const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })

// Try upload
try {
  const url = await uploadProductImage(file, 'test-store-id')
  console.log('Upload success:', url)
} catch (error) {
  console.error('Upload failed:', error)
}
```

---

### 6. Check RLS Policy Logic

**Test INSERT policy:**
```sql
-- Run as authenticated user in Supabase SQL Editor
SELECT 
  bucket_id,
  (storage.foldername('business-123/test.jpg'))[1] as folder,
  EXISTS(
    SELECT 1 FROM businesses 
    WHERE id = 'business-123' 
    AND owner_id = auth.uid()
  ) as owns_business,
  auth.uid() as user_id,
  auth.role() as user_role;
```

**Expected output:**
```
bucket_id: product-images
folder: business-123
owns_business: true
user_id: [your-user-id]
user_role: authenticated
```

---

## Step-by-Step Debug Process

### Step 1: Verify Bucket Exists
```
1. Open Supabase Dashboard
2. Go to Storage
3. Look for "product-images" bucket
4. If missing, create it (Public)
```

### Step 2: Check Authentication
```typescript
// In your component
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user?.id) // Should show user ID
```

### Step 3: Test Storage Access
```typescript
// Try listing bucket
const { data, error } = await supabase.storage
  .from('product-images')
  .list()

console.log('List result:', data, error)
// Should return array of files (or empty array)
```

### Step 4: Test Upload
```typescript
// Try simple upload
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('test/test.txt', new Blob(['hello']))

console.log('Upload result:', data, error)
// Should return file metadata
```

### Step 5: Check Policies
```sql
-- In Supabase SQL Editor
SELECT * FROM storage.objects 
WHERE bucket_id = 'product-images' 
LIMIT 1;
-- Should return files (if any exist)
```

---

## Common Mistakes

### ❌ Bucket Not Public
```
Symptom: Public can't view images
Solution: Make bucket public in settings
```

### ❌ Wrong Path Format
```typescript
// Wrong
upload('image.jpg', file) // Missing storeId

// Right
upload(`${storeId}/image.jpg`, file)
```

### ❌ Missing Auth
```typescript
// Wrong - not checking auth
await uploadProductImage(file, storeId)

// Right - check first
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')
await uploadProductImage(file, storeId)
```

### ❌ Policy Checks Wrong Table
```sql
-- Wrong - checking products table
WHERE owner_id IN (SELECT owner_id FROM products WHERE id = ...)

-- Right - checking businesses table
WHERE owner_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
```

### ❌ Using Server Client in Browser
```typescript
// Wrong - in client component
import { createClient } from '@/lib/supabase/server'

// Right
import { createClient } from '@/lib/supabase/client'
```

---

## Quick Fixes

### Fix 1: Reset RLS Policies
```sql
-- Drop all policies
DROP POLICY IF EXISTS "Public can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their business folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- Disable RLS temporarily (TESTING ONLY)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Try upload now - if it works, RLS is the issue
-- Then re-enable and create correct policies
```

### Fix 2: Simplify Policy (Testing)
```sql
-- Simple policy that allows any authenticated user to upload
CREATE POLICY "test_upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- If this works, the issue is with the folder check
```

### Fix 3: Check businessId Format
```typescript
// In your code, log businessId
console.log('Business ID:', businessId)
console.log('Type:', typeof businessId)
console.log('Is UUID?:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessId))

// Should output:
// Business ID: 550e8400-e29b-41d4-a716-446655440000
// Type: string
// Is UUID?: true
```

---

## Error Message Decoder

### "new row violates row-level security policy for table 'objects'"
→ RLS policy blocking the upload
→ Check: User authentication, business ownership, policy logic

### "Bucket not found"
→ Bucket doesn't exist
→ Check: Bucket name is exactly "product-images"

### "Invalid file type"
→ Validation in uploadImage.ts
→ Check: File is jpg/png/webp

### "File size exceeds 2MB"
→ Validation in uploadImage.ts
→ Check: File is under 2MB

### "Upload failed: [Supabase error]"
→ Generic Supabase error
→ Check: Supabase logs in dashboard

### "No file provided"
→ File is null or undefined
→ Check: File input has file

### "Invalid store ID"
→ storeId is invalid
→ Check: storeId is valid UUID

---

## Testing Script

Copy this into browser console:

```typescript
// Complete upload test
async function testUpload() {
  console.log('=== UPLOAD DEBUG TEST ===')
  
  // 1. Check environment
  console.log('1. Environment:')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
  
  // 2. Check auth
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('2. Authentication:')
  console.log('   User ID:', user?.id)
  console.log('   Email:', user?.email)
  
  // 3. Check bucket
  const { data: buckets } = await supabase.storage.listBuckets()
  console.log('3. Buckets:')
  console.log('   Available:', buckets?.map(b => b.name))
  console.log('   Has product-images?', buckets?.some(b => b.name === 'product-images'))
  
  // 4. Check business
  const businessId = 'YOUR_BUSINESS_ID_HERE' // Replace this
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .single()
  console.log('4. Business:')
  console.log('   Exists?', !!business)
  
  // 5. Try upload
  console.log('5. Upload test:')
  const blob = new Blob(['test'], { type: 'image/jpeg' })
  const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })
  
  try {
    const url = await uploadProductImage(file, businessId)
    console.log('   SUCCESS:', url)
  } catch (error) {
    console.error('   FAILED:', error)
  }
  
  console.log('=== TEST COMPLETE ===')
}

// Run test
testUpload()
```

---

## Get Help

If still having issues, provide:

1. **Error message** (exact text)
2. **Browser console** (screenshot)
3. **Network tab** (failed request details)
4. **Supabase logs** (from dashboard)
5. **RLS policy** (copy from SQL editor)
6. **Code snippet** (where upload is called)

---

## Quick Reference

### ✅ Working Setup Checklist
- [ ] Bucket "product-images" exists
- [ ] Bucket is public
- [ ] RLS enabled on storage.objects
- [ ] 4 RLS policies created
- [ ] User is authenticated
- [ ] User owns the business
- [ ] businessId is valid UUID
- [ ] File is jpg/png/webp
- [ ] File is under 2MB
- [ ] Path format: {storeId}/{filename}

### 🔧 Debug Commands

```typescript
// Check client
const supabase = createClient()
console.log(supabase.auth.getUser())

// List buckets
await supabase.storage.listBuckets()

// List files
await supabase.storage.from('product-images').list()

// Test upload
await supabase.storage.from('product-images').upload('test.txt', new Blob(['hi']))
```

---

**Need more help?** Run the testing script above and share the output!
