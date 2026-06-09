# Supabase Email Confirmation Setup Guide

## Problem
Users are not receiving confirmation emails after signup, or the confirmation link redirects to the wrong place.

## Solution
You must configure Supabase to use the correct redirect URLs for email confirmation.

---

## Step 1: Get Your Deployed URL

Your app is deployed on Vercel at:
```
https://dukaanify-jler.vercel.app
```

---

## Step 2: Configure Supabase Auth Settings

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **URL Configuration** (left sidebar)
3. Update the following fields:

### Site URL
```
https://dukaanify-jler.vercel.app
```

### Redirect URLs
Add these URLs (one per line):
```
https://dukaanify-jler.vercel.app/api/auth/callback
https://dukaanify-jler.vercel.app/dashboard
http://localhost:3000/api/auth/callback
http://localhost:3000/dashboard
```

### Additional Redirect URLs (Optional)
```
https://dukaanify-jler.vercel.app/login
https://dukaanify-jler.vercel.app/register
http://localhost:3000/login
http://localhost:3000/register
```

**Screenshot Reference:**
- Go to: `https://app.supabase.com/project/[YOUR_PROJECT_ID]/auth/url-configuration`
- Replace `[YOUR_PROJECT_ID]` with your Supabase project ID (first part of your SUPABASE_URL)

---

## Step 3: Update Environment Variables (Optional)

If you want to explicitly set the deployed URL in your app:

Create `.env.production` (for Vercel):
```env
NEXT_PUBLIC_SUPABASE_URL=https://iprvwdsniwmspdmewzbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://dukaanify-jler.vercel.app
NEXT_PUBLIC_APP_NAME=Dukaanify
ADMIN_EMAIL=khanwal11992858@gmail.com
```

---

## Step 4: Enable Email Confirmation

1. In **Supabase Dashboard** → **Authentication** → **Providers**
2. Under **Email**, make sure:
   - ✅ **Enable Email provider** is turned ON
   - ✅ **Confirm email** is turned ON
3. Click **Save**

---

## Step 5: Test the Flow

### Local Testing
1. Run: `npm run dev`
2. Go to: `http://localhost:3000/register`
3. Fill the form and submit
4. Check the Supabase **Auth** tab → **Users** for the new user
5. User should be marked as `email_confirmed: false`
6. In production, they'll receive a confirmation email (check spam folder)
7. Click the link in the email → Should redirect to dashboard

### Production Testing (After Deployment)
1. Go to: `https://dukaanify-jler.vercel.app/register`
2. Sign up with a test email
3. Check your email for the confirmation link
4. Click the link → Should redirect to `https://dukaanify-jler.vercel.app/dashboard`

---

## Step 6: What Happens After Email Confirmation

When user clicks the email confirmation link:
1. They're redirected to: `/api/auth/callback?code=XXX&type=signup`
2. The callback route exchanges the code for a session (creates JWT token)
3. User is redirected to `/dashboard` as authenticated user
4. Next time they visit, they stay logged in (session persists)

---

## File Locations (Code Changes Made)

### Updated Files:
- `components/auth/RegisterForm.tsx` - Now uses dynamic redirect URL
- `.env.local` - Added comment for deployed URL

### Callback Handler:
- `app/api/auth/callback/route.ts` - Handles the email confirmation redirect

### Authentication Flows:
- **Signup**: `/app/(auth)/register/page.tsx` → `RegisterForm` component
- **Email Confirmation**: Supabase sends email → User clicks link → `/api/auth/callback` → `/dashboard`
- **Password Reset**: `/app/(auth)/forgot-password/page.tsx` → Works the same way

---

## Troubleshooting

### Users not receiving confirmation emails?
- Check **Supabase** → **Authentication** → **Providers** → Email is enabled
- Check your email spam/junk folder
- Verify the site URL is correct in Supabase settings
- Test with an actual email address (not test@example.com)

### Email link opens but shows "error=auth_callback_failed"?
- The redirect URL in `.signUp()` doesn't match the one configured in Supabase
- Verify `/api/auth/callback` URL is added to Supabase redirect URLs
- Check that `emailRedirectTo` is using `window.location.origin` (works in browser)

### After clicking email link, user is not logged in?
- The `exchangeCodeForSession()` call failed
- Check browser console for errors
- Verify Supabase session storage is working (check localStorage)

### Redirect loop or wrong redirect URL?
- The `next` parameter in callback might be set incorrectly
- Check `searchParams.get('next')` in `/api/auth/callback/route.ts`
- Default should be `/dashboard` which requires authentication

---

## How the Code Works

### RegisterForm Component (`components/auth/RegisterForm.tsx`)
```typescript
const redirectUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/auth/callback`
  : process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback'

const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
    emailRedirectTo: redirectUrl,  // ← Supabase sends confirmation email with this link
  },
})
```

### Callback Route (`app/api/auth/callback/route.ts`)
```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)  // ← Validate & create session
    
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)  // ← Redirect to dashboard after confirmed
    }
  }
  
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

---

## Next Steps

1. **Configure Supabase URL Settings** (Step 2 above) — This is the most important step!
2. Test signup flow locally
3. Deploy to Vercel
4. Test signup flow on production
5. Confirm users receive emails and can verify

---

**Questions?** Check Supabase docs: https://supabase.com/docs/guides/auth/overview
