# Upload Troubleshooting - Quick Reference

Quick fixes for common Dukaanify image upload issues.

---

## 🚨 Common Errors

### "Bucket not found"
```
✓ Go to Supabase → Storage
✓ Create bucket: "product-images"
✓ Set visibility: Public
```

### "Permission denied"
```
✓ Check user is logged in
✓ Check user owns the business
✓ Run RLS policies SQL (see UPLOAD_DEBUG_GUIDE.md)
```

### "Invalid file type"
```
✓ Use only: jpg, png, webp
✓ Check file.type in console
```

### "File size exceeds 2MB"
```
✓ Compress image before upload
✓ Or change limit in lib/uploadImage.ts
```

---

## 🔍 Quick Diagnostic

### 1. Check Authentication
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user?.id)
// Should show user ID
```

### 2. Check Bucket
```typescript
const { data } = await supabase.storage.listBuckets()
console.log('Buckets:', data?.map(b => b.name))
// Should include "product-images"
```

### 3. Check Business Ownership
```typescript
const { data } = await supabase
  .from('businesses')
  .select('*')
  .eq('id', businessId)
  .eq('owner_id', user.id)
  .single()
console.log('Business:', data)
// Should return business object
```

### 4. Test Upload
```typescript
const blob = new Blob(['test'], { type: 'image/jpeg' })
const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })

const url = await uploadProductImage(file, businessId)
console.log('URL:', url)
// Should return Supabase URL
```

---

## 🛠️ Quick Fixes

### Reset RLS Policies
```sql
-- Copy from STORAGE_RLS_POLICIES.sql and run
```

### Check Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here

# Restart dev server after changing
```

### Verify Bucket is Public
```
1. Supabase → Storage → product-images
2. Click settings icon
3. Check "Public bucket" is ON
```

---

## 📋 Diagnostic Script

Copy this into browser console:

```typescript
// Replace with your business ID
const businessId = "your-business-id-here"

// Run diagnostic
async function test() {
  const supabase = createClient()
  
  // 1. Auth
  const { data: { user } } = await supabase.auth.getUser()
  console.log('✓ User:', user?.email)
  
  // 2. Bucket
  const { data } = await supabase.storage.listBuckets()
  console.log('✓ Buckets:', data?.map(b => b.name))
  
  // 3. Business
  const { data: biz } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()
  console.log('✓ Business:', biz?.name)
  console.log('✓ You own it?', biz?.owner_id === user?.id)
  
  // 4. Upload
  const blob = new Blob(['test'], { type: 'image/jpeg' })
  const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })
  const url = await uploadProductImage(file, businessId)
  console.log('✓ Upload worked! URL:', url)
}

test()
```

---

## 📖 Full Guides

- **UPLOAD_DEBUG_GUIDE.md** - Complete troubleshooting
- **STORAGE_RLS_POLICIES.sql** - RLS policies script
- **diagnose-upload.ts** - Full diagnostic script

---

## 🆘 Still Having Issues?

Run the full diagnostic:

```typescript
// In browser console
import { diagnoseUpload } from './diagnose-upload'
diagnoseUpload('your-business-id')
```

Then check the output for specific issues.

---

## ✅ Working Setup Checklist

- [ ] Bucket "product-images" exists
- [ ] Bucket is public
- [ ] RLS enabled
- [ ] 4 RLS policies created
- [ ] User authenticated
- [ ] User owns business
- [ ] businessId is valid UUID
- [ ] File is jpg/png/webp
- [ ] File < 2MB

If all checked, upload should work! ✓
