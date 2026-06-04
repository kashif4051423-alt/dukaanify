# Dukaanify - Deployment Guide

## Quick Deployment to Vercel/Netlify

### Prerequisites
- Node.js 18+ installed
- Git repository initialized
- Vercel or Netlify account

---

## **Option 1: Deploy to Vercel (Recommended)**

### Step 1: Build the Project
```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

### Step 2: Deploy to Vercel

#### Method A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

#### Method B: Using Git (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and configure everything
6. Click "Deploy"

### Step 3: Configure Environment Variables
In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Step 4: Deploy
Vercel will automatically deploy on every push to main branch.

---

## **Option 2: Deploy to Netlify**

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Deploy to Netlify

#### Method A: Using Netlify CLI
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=.next
```

#### Method B: Using Git
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Set build command: `npm run build`
6. Set publish directory: `.next`
7. Click "Deploy"

### Step 3: Configure Environment Variables
In Netlify Dashboard:
1. Go to Site Settings → Build & Deploy → Environment
2. Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

---

## **Option 3: Manual Deployment (Any Hosting)**

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Upload Build Files
Upload these folders to your hosting:
- `.next/` - Production build
- `public/` - Static files
- `node_modules/` - Dependencies (or run `npm install` on server)

### Step 3: Start the Server
```bash
npm start
```

The app will run on `http://localhost:3000`

---

## **Build Output Structure**

After running `npm run build`, you'll have:

```
.next/
├── static/          # Optimized JavaScript/CSS
├── server/          # Server-side code
├── cache/           # Build cache
└── standalone/      # Standalone build (optional)

public/
├── logo.svg
├── images/
└── ...

node_modules/       # Dependencies
package.json
package-lock.json
```

---

## **Environment Variables Required**

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: For production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## **Deployment Checklist**

- [ ] Run `npm run build` locally and verify no errors
- [ ] Test the build: `npm start`
- [ ] Push code to Git repository
- [ ] Set up environment variables on hosting platform
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL certificate (auto on Vercel/Netlify)
- [ ] Test all pages after deployment
- [ ] Set up monitoring/logging

---

## **Performance Optimization**

The build includes:
- ✅ Code splitting
- ✅ Image optimization
- ✅ CSS minification
- ✅ JavaScript minification
- ✅ Static generation where possible
- ✅ Server-side rendering for dynamic pages

---

## **Troubleshooting**

### Build fails with "Module not found"
```bash
npm install
npm run build
```

### Port already in use
```bash
# Change port
PORT=3001 npm start
```

### Environment variables not loading
- Verify `.env.local` exists
- Restart the server
- Check variable names match exactly

### Database connection errors
- Verify Supabase credentials
- Check network connectivity
- Ensure service role key is correct

---

## **Support**

For issues:
1. Check build logs
2. Verify environment variables
3. Test locally first
4. Check Supabase status

---

**Last Updated:** May 2026
**Version:** 1.0.0
