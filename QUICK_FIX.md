# 🚨 Quick Fix: "Bucket not found" Error

## TL;DR

**Error:** `Upload failed: Bucket not found`

**Fix:** The bucket probably doesn't exist. Create it!

---

## ⚡ 3-Step Fix

### Step 1: Create Bucket
1. Open: https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets
2. Click "New bucket"
3. Name: `product-images`
4. ✓ Check "Public bucket"
5. Click "Create bucket"

### Step 2: Restart Dev Server
```bash
# Ctrl+C to stop
npm run dev
```

### Step 3: Test
Go to: http://localhost:3000/test-storage
- Click "Run Diagnostics"
- Try test upload

---

## 🎯 Verify It's Fixed

**Quick check:**
```bash
node check-bucket.mjs
```

**Should see:**
```
✅ Bucket "product-images" exists!
✨ Everything looks good!
```

---

## 🔧 Still Not Working?

**Open test page:**
http://localhost:3000/test-storage

**It will tell you exactly what's wrong!**

---

## 📝 Checklist

- [ ] Created bucket in Supabase Dashboard
- [ ] Bucket name is exactly `product-images`
- [ ] Bucket is PUBLIC
- [ ] Restarted dev server
- [ ] Logged in to app (authenticated)

---

## 💡 Key Points

1. **SQL policies ≠ bucket creation** - Must create bucket manually in UI
2. **Always restart** after changing `.env.local`
3. **Must be logged in** for RLS policies to work
4. **Bucket must be PUBLIC** for URLs to work

---

**Need more help?** Read: `DEBUG_BUCKET_ERROR.md`
