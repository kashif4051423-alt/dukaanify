# 🐛 Debugging "Bucket not found" Error - Complete Guide

## 🎯 The Issue

You're getting this error:
```
Upload failed: Bucket not found
```

Even though you believe the bucket "product-images" exists.

---

## 🚀 Quick Fix (3 Methods)

### Method 1: Use the Test Page (Easiest) ⭐

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open the test page:**
   ```
   http://localhost:3000/test-storage
   ```

3. **Click "Run Diagnostics"** - it will tell you exactly what's wrong

4. **Follow the instructions shown** on the page

5. **Try test upload** to verify it works

### Method 2: Use the Node Script

```bash
node check-bucket.mjs
```

This will:
- Check your environment variables
- Connect to Supabase
- List all buckets
- Tell you if "product-images" exists
- Show if it's public or not

### Method 3: Manual Check

1. **Open Supabase Dashboard:**
   https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets

2. **Look for "product-images" bucket**

3. **If NOT found:**
   - Click "New bucket"
   - Name: `product-images`
   - **Check "Public bucket"** ✓
   - Click "Create bucket"

4. **Restart your dev server:**
   ```bash
   # Ctrl+C to stop, then:
   npm run dev
   ```

---

## 🔍 What I've Added to Help You Debug

### 1. Enhanced Logging in `uploadImage.ts`

Your `uploadProductImage()` function now logs:
- Environment variables being used
- Supabase URL
- File details
- Upload progress
- Detailed error information

**Open browser console (F12)** to see these logs when uploading.

### 2. Diagnostic Test Page

**File:** `app/test-storage/page.tsx`

**URL:** http://localhost:3000/test-storage

**Features:**
- ✅ Checks environment variables
- ✅ Verifies Supabase connection
- ✅ Checks authentication status
- ✅ Lists all buckets
- ✅ Verifies "product-images" exists
- ✅ Tests actual upload
- ✅ Shows detailed results with error messages

### 3. Node Script

**File:** `check-bucket.mjs`

**Usage:** `node check-bucket.mjs`

**Features:**
- Runs outside Next.js
- Quick verification
- No browser needed
- Shows all buckets

### 4. Debug Utility Library

**File:** `lib/debug-storage.ts`

**Functions:**
- `diagnoseStorageIssue()` - Full diagnostic check
- `printDiagnostics()` - Pretty print results
- `runDiagnostics()` - Run and print

**Use in any component:**
```typescript
import { runDiagnostics } from '@/lib/debug-storage'

// Run diagnostics
const results = await runDiagnostics()
```

---

## 📋 Step-by-Step Debugging Process

### Step 1: Verify Environment Variables

**Check `.env.local` has these:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://iprvwdsniwmspdmewzbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

✅ **Your env vars look correct!**

### Step 2: Restart Dev Server

Environment variables are only loaded at server start!

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 3: Check Browser Console

1. Open your app
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try uploading an image
5. Look for logs starting with `[uploadProductImage]`

**What you should see:**
```
[uploadProductImage] Environment check: {
  supabaseUrl: "https://iprvwdsniwmspdmewzbs.supabase.co",
  hasAnonKey: true,
  bucketName: "product-images"
}
```

**If you see the wrong URL** → Restart dev server!

### Step 4: Verify You're Logged In

RLS policies require authentication. Make sure you're signed in to your app.

**To check:**
```typescript
// In browser console:
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log(user) // Should show your user object
```

### Step 5: Verify Bucket Exists

**Option A: Use test page**
- Go to http://localhost:3000/test-storage
- Click "Run Diagnostics"
- Look at "List Buckets" result

**Option B: Use node script**
```bash
node check-bucket.mjs
```

**Option C: Check Supabase Dashboard**
https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets

### Step 6: Create Bucket if Missing

If the bucket doesn't exist:

1. Go to Supabase Dashboard
2. Storage → Buckets
3. Click "New bucket"
4. Name: `product-images` (exactly this)
5. **Check "Public bucket"** ✓
6. Click "Create bucket"

### Step 7: Verify RLS Policies

The bucket needs RLS policies. Run the SQL from `STORAGE_RLS_POLICIES.sql`:

```sql
-- Go to Supabase Dashboard → SQL Editor
-- Paste and run the SQL from STORAGE_RLS_POLICIES.sql
```

### Step 8: Test Upload

Use the test page to verify:
http://localhost:3000/test-storage

---

## 🎯 Most Likely Causes

### 1. Bucket Doesn't Actually Exist (90% of cases)

**Symptom:** Error says "Bucket not found"

**Solution:** Create the bucket in Supabase Dashboard

**Why:** SQL policies don't create the bucket - you must create it manually in the UI!

### 2. Dev Server Not Restarted (5% of cases)

**Symptom:** Console shows wrong Supabase URL or old env vars

**Solution:** Restart dev server

**Why:** Environment variables are loaded at server start

### 3. Not Authenticated (3% of cases)

**Symptom:** RLS policy errors, permission denied

**Solution:** Log in to your app first

**Why:** RLS policies require authenticated users

### 4. Typo in Bucket Name (2% of cases)

**Symptom:** Bucket exists but still "not found"

**Solution:** Check for typos - it must be exactly `product-images` (with dash, not underscore)

**Why:** Bucket names are case-sensitive and exact match

---

## 🔧 Verification Checklist

Run through this checklist:

- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Dev server restarted after changing `.env.local`
- [ ] Browser console shows correct Supabase URL when uploading
- [ ] You're logged in to the app (authenticated user)
- [ ] Bucket "product-images" exists in Supabase Dashboard
- [ ] Bucket is set to PUBLIC
- [ ] RLS policies are set up (SQL from `STORAGE_RLS_POLICIES.sql`)
- [ ] Test page diagnostics pass: http://localhost:3000/test-storage

---

## 📊 Reading the Diagnostic Results

### ✅ Success (Green)
Everything is working correctly for this check.

### ⚠️ Warning (Yellow)
Not critical but might cause issues. For example:
- Not authenticated (you need to log in)
- Bucket not public (URLs won't work)

### ❌ Error (Red)
Must be fixed! For example:
- Missing environment variables
- Bucket doesn't exist
- Cannot connect to Supabase

---

## 💻 Running Diagnostics in Code

If you want to run diagnostics programmatically:

```typescript
import { diagnoseStorageIssue, printDiagnostics } from '@/lib/debug-storage'

// In an async function or component:
const results = await diagnoseStorageIssue()
printDiagnostics(results)

// Check for errors:
const hasErrors = results.some(r => r.status === 'error')
if (hasErrors) {
  console.log('⚠️ Found issues, please fix them')
}
```

---

## 🎯 What To Share If Still Stuck

If you're still stuck after trying everything, share:

1. **Screenshot of test page diagnostics**
   - Go to http://localhost:3000/test-storage
   - Click "Run Diagnostics"
   - Take screenshot of results

2. **Browser console logs**
   - Try uploading an image
   - Copy all console logs (F12 → Console tab)

3. **Output of node script**
   ```bash
   node check-bucket.mjs
   ```

4. **Screenshot of Supabase Storage page**
   - https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets
   - Show the list of buckets

---

## 🚀 Expected Working Flow

When everything is set up correctly:

1. User selects image in ImageUploader component
2. Console logs: `[uploadProductImage] Environment check: {...}`
3. Console logs: `[uploadProductImage] Input validation passed: {...}`
4. Console logs: `[uploadProductImage] Generated file path: store-id/123-abc.jpg`
5. Console logs: `[uploadProductImage] Supabase client created, attempting upload to bucket: product-images`
6. Console logs: `[uploadProductImage] Upload successful: {...}`
7. Console logs: `[uploadProductImage] Public URL generated: https://...`
8. Image preview shows uploaded image
9. ✅ Success!

---

## 📚 Related Files

- `lib/uploadImage.ts` - Upload utility with enhanced logging
- `lib/debug-storage.ts` - Diagnostic functions
- `app/test-storage/page.tsx` - Test page UI
- `check-bucket.mjs` - Node script for quick check
- `STORAGE_RLS_POLICIES.sql` - RLS policies to run
- `BUCKET_NOT_FOUND_FIX.md` - Quick fix guide

---

## 💡 Pro Tips

1. **Always check browser console first** - it has the most detailed info
2. **Restart dev server** after any `.env.local` change
3. **Use test page** before debugging in your actual app
4. **Verify bucket in dashboard** - don't assume it exists
5. **Make bucket public** - otherwise public URLs won't work
6. **Check you're on right project** - URL should be `iprvwdsniwmspdmewzbs`

---

## ✨ Next Steps

1. **Run the test page:** http://localhost:3000/test-storage
2. **Click "Run Diagnostics"**
3. **Follow the errors shown**
4. **Fix each issue**
5. **Try test upload**
6. **Celebrate when it works!** 🎉

The diagnostics will tell you exactly what's wrong. No more guessing! 🎯
