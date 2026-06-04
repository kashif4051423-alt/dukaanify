# Quick Netlify Deployment Guide

## ✅ Build Complete!

Your project has been built successfully. The `.next` folder contains all production files.

---

## 📦 What to Upload to Netlify

### Files to Upload:
```
.next/                    ← Main build folder (UPLOAD THIS)
public/                   ← Static assets
package.json
netlify.toml
```

### Total Size: ~50-100 MB

---

## 🚀 Deployment Steps

### Step 1: Go to Netlify
```
https://app.netlify.com
```

### Step 2: Create New Site
- Click "Add new site"
- Select "Deploy manually"

### Step 3: Upload Files
Drag and drop these folders:
1. `.next` folder
2. `public` folder

### Step 4: Add Environment Variables
Go to: **Site Settings → Build & Deploy → Environment**

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://iprvwdsniwmspdmewzbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcnZ3ZHNuaXdtc3BkbWV3emJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzI3ODcsImV4cCI6MjA5MzA0ODc4N30.n7J4YdxesHsRfDuNVDqZIMRTadyYyTQO1tfOI9ZUaTs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcnZ3ZHNuaXdtc3BkbWV3emJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3Mjc4NywiZXhwIjoyMDkzMDQ4Nzg3fQ.FyrEbbUizcqsJA08gEB5eM3EfX7iDolBzW7S0-sUcyc
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXT_PUBLIC_APP_NAME=Dukaanify
ADMIN_EMAIL=khanwal11992858@gmail.com
```

### Step 5: Deploy
Click "Deploy site"

---

## ✅ After Deployment

Test these URLs:

1. **Home:** https://your-site.netlify.app
2. **Admin Panel:** https://your-site.netlify.app/admin
3. **Upgraded Plans:** https://your-site.netlify.app/admin/upgraded-plans
4. **Store:** https://your-site.netlify.app/store/crusty

---

## 🔐 Admin Access

Only this email can access admin panel:
```
khanwal11992858@gmail.com
```

---

## 📁 Build Folder Location

```
c:\Users\Vexxor Technologies\Desktop\secreat\build and sell\dukaanify\.next
```

This folder contains all compiled production files.

---

## 🆘 If Build Fails

```bash
# Clean and rebuild
rm -r .next node_modules
npm install
npm run build
```

---

## 📝 Netlify Configuration

The `netlify.toml` file is already configured with:
- ✅ Build command
- ✅ Publish directory
- ✅ Redirects
- ✅ Security headers

No additional configuration needed!

---

## 🎯 Summary

1. ✅ Build complete (`.next` folder ready)
2. 📤 Upload `.next` + `public` to Netlify
3. 🔑 Add environment variables
4. 🚀 Deploy
5. ✨ Done!

Your app will be live in minutes!
