# Dukaanify - Netlify Deployment Guide

## Step 1: Build the Project Locally

```bash
cd "c:\Users\Vexxor Technologies\Desktop\secreat\build and sell\dukaanify"

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `.next` folder with all compiled files.

---

## Step 2: Prepare for Netlify

### Option A: Using Netlify CLI (Recommended)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option B: Manual Upload

1. Go to https://app.netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `.next` folder
4. Wait for deployment

---

## Step 3: Environment Variables

Add these to Netlify Site Settings → Build & Deploy → Environment:

```
NEXT_PUBLIC_SUPABASE_URL=https://iprvwdsniwmspdmewzbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcnZ3ZHNuaXdtc3BkbWV3emJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzI3ODcsImV4cCI6MjA5MzA0ODc4N30.n7J4YdxesHsRfDuNVDqZIMRTadyYyTQO1tfOI9ZUaTs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcnZ3ZHNuaXdtc3BkbWV3emJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3Mjc4NywiZXhwIjoyMDkzMDQ4Nzg3fQ.FyrEbbUizcqsJA08gEB5eM3EfX7iDolBzW7S0-sUcyc
NEXT_PUBLIC_APP_URL=https://your-netlify-domain.netlify.app
NEXT_PUBLIC_APP_NAME=Dukaanify
ADMIN_EMAIL=khanwal11992858@gmail.com
```

---

## Step 4: Configure Netlify

### netlify.toml (Already Created)

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `.next`
- Redirects for SPA routing
- Security headers

---

## Step 5: Deploy

### Using Git (Recommended for Production)

1. Push code to GitHub/GitLab
2. Connect repo to Netlify
3. Netlify auto-deploys on every push

```bash
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

### Using Netlify CLI

```bash
netlify deploy --prod
```

---

## Step 6: Verify Deployment

After deployment, test:

1. **Home Page:** https://your-domain.netlify.app
2. **Admin Panel:** https://your-domain.netlify.app/admin
3. **Upgraded Plans:** https://your-domain.netlify.app/admin/upgraded-plans
4. **Store:** https://your-domain.netlify.app/store/crusty

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

1. Go to Netlify Site Settings
2. Build & Deploy → Environment
3. Add all variables
4. Trigger a new deploy

### Admin Panel Not Accessible

- Check email: `khanwal11992858@gmail.com`
- Verify Supabase auth is working
- Check browser console for errors

### Database Connection Issues

- Verify Supabase credentials in `.env.local`
- Check Supabase project is active
- Test connection locally first

---

## File Structure for Deployment

```
dukaanify/
├── .next/                    ← Build output (upload this)
├── public/                   ← Static files
├── app/                      ← Next.js app
├── components/               ← React components
├── lib/                      ← Utilities
├── netlify.toml             ← Netlify config
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## Production Checklist

- [ ] Build locally: `npm run build`
- [ ] Test locally: `npm run dev`
- [ ] Add environment variables to Netlify
- [ ] Deploy to Netlify
- [ ] Test all pages on production
- [ ] Verify admin access (khanwal11992858@gmail.com only)
- [ ] Test store pages
- [ ] Test dashboard
- [ ] Check database connections
- [ ] Monitor Netlify logs

---

## Useful Commands

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Check build size
npm run build -- --analyze

# Deploy with Netlify CLI
netlify deploy --prod

# View Netlify logs
netlify logs
```

---

## Support

For issues:
1. Check Netlify logs: https://app.netlify.com/sites/your-site/deploys
2. Check browser console (F12)
3. Check Supabase logs
4. Check environment variables are set

---

## Next Steps

1. Build: `npm run build`
2. Deploy: `netlify deploy --prod`
3. Test: Visit your Netlify domain
4. Monitor: Check Netlify dashboard

Good luck! 🚀
