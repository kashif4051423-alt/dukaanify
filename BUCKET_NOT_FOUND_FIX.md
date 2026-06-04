# 🔧 Fix "Bucket not found" Error

## Quick Fix (Most Common Issues)

### Issue 1: Bucket doesn't actually exist ❌
**Solution:** Create the bucket in Supabase Dashboard

1. Go to: https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets
2. Click "New bucket"
3. Name: `product-images`
4. **Make it PUBLIC** ✓
5. Click "Create bucket"

### Issue 2: Dev server not restarted 🔄
**Solution:** Restart your Next.js dev server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Environment variables are only loaded when the server starts!

### Issue 3: Not logged in 🔐
**Solution:** Make sure you're authenticated

The RLS policies require you to be logged in to upload images. Test upload while signed in to your app.

---

## 🧪 Use the Test Page

I've created a test page to diagnose the exact issue:

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/test-storage

3. Click **"Run Diagnostics"** - this will tell you exactly what's wrong

4. Follow the instructions shown on the page

---

## 🔍 What the Diagnostics Check

The test page checks:

1. ✅ **Environment Variables**
   - Is `NEXT_PUBLIC_SUPABASE_URL` set?
   - Is `NEXT_PUBLIC_SUPABASE_ANON_KEY` set?
   - Are they correct?

2. ✅ **Supabase Client**
   - Can it connect to Supabase?
   - Is the URL correct?

3. ✅ **Authentication**
   - Are you logged in?
   - Is the user session valid?

4. ✅ **Bucket Existence**
   - Does "product-images" bucket exist?
   - Is it public?
   - What other buckets exist?

5. ✅ **Test Upload**
   - Can you actually upload a file?
   - What error occurs?

---

## 📊 Understanding Console Logs

I've added detailed logging to `uploadImage.ts`. Check your browser console (F12) for:

```
[uploadProductImage] Environment check: { ... }
[uploadProductImage] Input validation passed: { ... }
[uploadProductImage] Generated file path: test-store-123/1234567890-abc123.jpg
[uploadProductImage] Supabase client created, attempting upload to bucket: product-images
```

**If you see this error:**
```
Upload failed: Bucket not found
```

**Then the bucket doesn't exist!** Create it in Supabase Dashboard (see Issue 1 above).

---

## 🎯 Most Likely Issue

Based on the error "Bucket not found", **99% chance the bucket doesn't exist in your Supabase project**.

Even if you created SQL policies, you still need to **manually create the bucket** in the Supabase Dashboard UI.

### How to verify:

1. Go to: https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets

2. Look for a bucket named `product-images`

3. If it's NOT there → Create it (see Issue 1)

4. If it IS there → Check the other issues

---

## 🔧 Create Bucket via Dashboard (Step-by-Step)

1. Open: https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets

2. You'll see the Storage page

3. Click the **"New bucket"** button (top right)

4. A modal appears:
   - **Name:** `product-images` (exactly this, no spaces)
   - **Public bucket:** ✓ **CHECK THIS BOX**
   - **File size limit:** 2MB (optional)
   - **Allowed MIME types:** leave empty (or add: image/jpeg, image/png, image/webp)

5. Click **"Create bucket"**

6. Done! Now run the test page again

---

## 📝 Verify Your Setup

After creating the bucket, verify:

```typescript
// In browser console or test page:
const supabase = createClient()
const { data, error } = await supabase.storage.listBuckets()
console.log(data) // Should show "product-images" in the list
```

---

## 🚀 Next Steps

1. **Go to test page:** http://localhost:3000/test-storage
2. **Run diagnostics**
3. **Follow the errors shown**
4. **Try test upload**
5. **Check console logs**

If it still doesn't work after following all steps, share:
- Screenshot of the diagnostic results from test page
- Browser console logs
- Screenshot of your Supabase Storage buckets page

---

## 💡 Pro Tips

- Always restart dev server after changing `.env.local`
- Environment variables with `NEXT_PUBLIC_` prefix are needed for client-side code
- RLS policies are separate from bucket creation - you need both!
- Make bucket PUBLIC if you want URLs to work without signed URLs
- Check you're on the correct Supabase project (URL: `iprvwdsniwmspdmewzbs`)

---

## 📞 Still Stuck?

Run the test page and share the output. The diagnostics will tell us exactly what's wrong! 🎯
