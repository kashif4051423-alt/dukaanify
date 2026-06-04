# 🔧 Debug Tools Ready

Complete debugging toolkit for Dukaanify image upload issues.

---

## 📁 Files Created

### 1. UPLOAD_DEBUG_GUIDE.md
**Complete troubleshooting guide**
- Common errors & solutions
- Debugging checklist
- Step-by-step debug process
- Error message decoder
- Testing scripts
- Quick fixes

### 2. diagnose-upload.ts
**Automated diagnostic script**
- Checks environment variables
- Verifies authentication
- Tests storage bucket
- Validates business ownership
- Tests RLS policies
- Attempts actual upload
- Provides detailed results

### 3. UPLOAD_TROUBLESHOOTING.md
**Quick reference card**
- Common errors
- Quick diagnostic commands
- Quick fixes
- Checklist

---

## 🚀 How to Debug

### Step 1: Identify the Error

Note the exact error message you're getting:
- "Bucket not found"
- "Permission denied"
- "Invalid file type"
- "File size exceeds"
- Other

### Step 2: Run Quick Diagnostic

Open browser console and run:

```typescript
// Quick check
const supabase = createClient()

// Check auth
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user?.id)

// Check bucket
const { data } = await supabase.storage.listBuckets()
console.log('Buckets:', data?.map(b => b.name))

// Test upload
const blob = new Blob(['test'], { type: 'image/jpeg' })
const file = new File([blob], 'test.jpg', { type: 'image/jpeg' })
const url = await uploadProductImage(file, 'your-business-id')
console.log('Result:', url)
```

### Step 3: Run Full Diagnostic

Copy `diagnose-upload.ts` into browser console, then:

```typescript
diagnoseUpload('your-business-id-here')
```

This will:
- ✓ Check all environment variables
- ✓ Verify authentication
- ✓ Test storage access
- ✓ Validate business ownership
- ✓ Test RLS policies
- ✓ Attempt real upload
- ✓ Provide detailed report

### Step 4: Check Solutions

Based on the diagnostic results, refer to:
- **UPLOAD_DEBUG_GUIDE.md** for detailed solutions
- **UPLOAD_TROUBLESHOOTING.md** for quick fixes

---

## 🎯 Common Issues & Quick Fixes

### Issue: "Bucket not found"
**Quick Fix:**
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `product-images`
4. Visibility: Public
5. Create

### Issue: "Permission denied"
**Quick Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire script from `STORAGE_RLS_POLICIES.sql`
3. Paste and run
4. Try upload again

### Issue: "User not authenticated"
**Quick Fix:**
```typescript
// Check session
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect to login
  window.location.href = '/login'
}
```

### Issue: "Invalid businessId"
**Quick Fix:**
```typescript
// Verify business exists and you own it
const { data } = await supabase
  .from('businesses')
  .select('*')
  .eq('id', businessId)
  .eq('owner_id', user.id)
  .single()

if (!data) {
  console.error('Business not found or access denied')
}
```

---

## 📊 Diagnostic Output Example

When you run `diagnoseUpload()`, you'll see:

```
🔍 DUKAANIFY UPLOAD DIAGNOSTIC
================================

1️⃣ ENVIRONMENT
   ✓ Supabase URL: https://abc123.supabase.co
   ✓ Has Anon Key: true

2️⃣ AUTHENTICATION
   ✓ User ID: 550e8400-e29b-41d4-a716-446655440000
   ✓ Email: user@example.com

3️⃣ STORAGE
   ✓ Available buckets: product-images, avatars
   ✓ Has product-images? YES
   ✓ Can list files
   ✓ Files found: 12

4️⃣ BUSINESS
   ✓ Business exists: My Store
   ✓ Owner ID: 550e8400-e29b-41d4-a716-446655440000
   ✓ You own this business? YES

5️⃣ RLS POLICIES
   ✓ Can upload to storage
   ✓ Test file uploaded: business-123/test-1704067200000.txt
   ✓ Test file cleaned up

6️⃣ IMAGE UPLOAD
   ✓ Upload successful!
   ✓ Image URL: https://abc123.supabase.co/storage/...
   ✓ Test image cleaned up

📊 SUMMARY
================================
✅ ALL CHECKS PASSED
Your upload setup is working correctly!
```

Or if issues found:

```
📊 SUMMARY
================================
❌ ISSUES FOUND:
   1. User not authenticated
   2. Bucket "product-images" not found
   3. RLS policy blocking upload

📖 See UPLOAD_DEBUG_GUIDE.md for solutions
```

---

## 🛠️ Tools Reference

### Check Environment
```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Check Authentication
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('Authenticated:', !!user)
```

### Check Bucket
```typescript
const { data } = await supabase.storage.listBuckets()
console.log('Has product-images:', data?.some(b => b.name === 'product-images'))
```

### Check RLS
```sql
-- In Supabase SQL Editor
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Test Upload
```typescript
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('test.txt', new Blob(['test']))
console.log('Result:', data, error)
```

---

## 📖 Documentation Map

| File | Purpose | When to Use |
|------|---------|-------------|
| **UPLOAD_TROUBLESHOOTING.md** | Quick reference | Need quick fix |
| **UPLOAD_DEBUG_GUIDE.md** | Complete guide | Need detailed help |
| **diagnose-upload.ts** | Diagnostic script | Need full diagnosis |
| **STORAGE_RLS_POLICIES.sql** | RLS policies | Need to set up RLS |
| **DEBUG_TOOLS_READY.md** | This file | Overview |

---

## 🔄 Debug Workflow

```
1. Error occurs
   ↓
2. Check UPLOAD_TROUBLESHOOTING.md for quick fix
   ↓
3. If not solved, run diagnoseUpload()
   ↓
4. Review diagnostic output
   ↓
5. Check UPLOAD_DEBUG_GUIDE.md for specific issue
   ↓
6. Apply solution
   ↓
7. Test again
   ↓
8. ✓ Working!
```

---

## 💡 Pro Tips

### Tip 1: Use Browser Console
Open DevTools (F12) → Console tab
All diagnostic commands run here

### Tip 2: Check Network Tab
DevTools → Network tab → Filter by "supabase"
See actual HTTP requests and responses

### Tip 3: Check Supabase Logs
Supabase Dashboard → Logs
See server-side errors

### Tip 4: Test in Incognito
Open incognito window
Rules out cache/cookie issues

### Tip 5: Simplify Policy First
Create simple policy that allows all authenticated users
If it works, the folder check is the issue

---

## 🆘 Still Stuck?

### Gather Information

1. **Error message** (exact text)
2. **Browser console output** (screenshot)
3. **Network tab** (screenshot of failed request)
4. **Diagnostic output** (from diagnose-upload.ts)
5. **RLS policies** (from SQL editor)

### Share for Help

Include all above information when asking for help.

---

## ✅ Success Indicators

You'll know it's working when:

✓ diagnoseUpload() shows "ALL CHECKS PASSED"
✓ Test upload returns valid URL
✓ Image appears in Supabase Storage
✓ Image displays in your app
✓ No errors in console

---

## 🎉 Ready to Debug!

You now have:
- ✅ Complete troubleshooting guide
- ✅ Automated diagnostic script
- ✅ Quick reference card
- ✅ RLS policies SQL
- ✅ Step-by-step process

**Start with:** `UPLOAD_TROUBLESHOOTING.md` for quick fixes
**Or run:** `diagnoseUpload('your-business-id')` for full diagnosis

Good luck! 🚀
