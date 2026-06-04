# Dukaanify - Build Instructions

## 🚀 Quick Start - Build for Production

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Project
```bash
npm run build
```

**Output:** Creates `.next/` folder with optimized production build

### Step 3: Test Locally
```bash
npm start
```

Visit: `http://localhost:3000`

---

## 📦 What Gets Built

When you run `npm run build`, Next.js creates:

```
.next/
├── static/
│   ├── chunks/          # JavaScript bundles
│   ├── css/             # Optimized CSS
│   └── media/           # Images & fonts
├── server/              # Server-side code
├── cache/               # Build cache
└── standalone/          # Standalone build
```

**Total Size:** ~50-100MB (with node_modules)

---

## 🌐 Deploy to Vercel (Easiest)

### Option A: Using Git (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js
   - Click "Deploy"

3. **Add Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     SUPABASE_SERVICE_ROLE_KEY=your_key
     ```

4. **Done!** Your site is live at `your-project.vercel.app`

### Option B: Using Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts to deploy.

---

## 🌐 Deploy to Netlify

### Option A: Using Git

1. **Push to GitHub** (same as above)

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository
   - Set:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy"

3. **Add Environment Variables**
   - Site Settings → Build & Deploy → Environment
   - Add same variables as Vercel

4. **Done!** Your site is live at `your-site.netlify.app`

### Option B: Using Netlify CLI

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=.next
```

---

## 📁 Manual Deployment (Any Hosting)

### Step 1: Build Locally
```bash
npm run build
```

### Step 2: Upload These Folders
- `.next/` - Production build
- `public/` - Static files
- `node_modules/` - Dependencies (or run `npm install` on server)
- `package.json` - Dependencies list
- `package-lock.json` - Lock file

### Step 3: On Your Server
```bash
npm install
npm start
```

Server runs on port 3000 by default.

---

## 🔧 Environment Variables

Create `.env.local` in project root:

```env
# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## ✅ Pre-Deployment Checklist

- [ ] Run `npm run build` - no errors?
- [ ] Run `npm start` - works locally?
- [ ] All pages load correctly?
- [ ] Admin panel accessible?
- [ ] Orders page working?
- [ ] Payments page working?
- [ ] Environment variables set?
- [ ] Database connected?
- [ ] Images loading?
- [ ] Forms submitting?

---

## 🐛 Troubleshooting

### Build Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Build Error: "Cannot find Supabase"
- Check `.env.local` exists
- Verify all environment variables
- Restart build process

### Site shows 404 after deployment
- Check build logs on hosting platform
- Verify `.next` folder uploaded
- Check environment variables

### Slow performance
- Check Lighthouse score
- Enable caching headers
- Optimize images
- Use CDN

---

## 📊 Build Statistics

After build completes, you'll see:

```
Route (pages)                              Size     First Load JS
┌ ○ /                                      123 kB   456 kB
├ ○ /pricing                               45 kB    234 kB
├ ○ /admin                                 89 kB    345 kB
├ ○ /admin/orders                          67 kB    289 kB
├ ○ /admin/payments                        56 kB    267 kB
└ ○ /dashboard                             78 kB    312 kB

○ (Static)  prerendered as static HTML
● (SSR)     server-side renders on-demand
```

---

## 🚀 Performance Tips

1. **Images**: Already optimized with Next.js Image
2. **CSS**: Tailwind CSS is tree-shaken
3. **JavaScript**: Code-split by route
4. **Caching**: Static pages cached
5. **Compression**: Gzip enabled

---

## 📞 Support

For deployment issues:
1. Check build logs
2. Verify environment variables
3. Test locally first
4. Check hosting platform status

---

**Ready to deploy?** Follow the steps above and your Dukaanify will be live! 🎉
