# Email Confirmation Setup Checklist

## ✅ Code Changes (DONE)

- [x] Updated `components/auth/RegisterForm.tsx` with dynamic redirect URL
- [x] Updated `.env.local` with deployment URL comment
- [x] Created `SUPABASE_AUTH_SETUP.md` guide
- [x] Created `EMAIL_CONFIRMATION_FIX.md` summary
- [x] Created `AUTH_FLOW_DIAGRAM.md` diagrams
- [x] Build compiles successfully with zero errors

---

## ⚠️ Supabase Configuration (YOU MUST DO THIS)

### URL Configuration
- [ ] Go to: https://app.supabase.com/project/[PROJECT_ID]/auth/url-configuration
- [ ] Set **Site URL** to:
  ```
  https://dukaanify-jler.vercel.app
  ```
- [ ] Add **Redirect URLs** (one per line):
  ```
  https://dukaanify-jler.vercel.app/api/auth/callback
  https://dukaanify-jler.vercel.app/dashboard
  http://localhost:3000/api/auth/callback
  http://localhost:3000/dashboard
  ```
- [ ] Click **Save**

### Email Provider Configuration
- [ ] Go to: https://app.supabase.com/project/[PROJECT_ID]/auth/providers
- [ ] Under **Email**:
  - [ ] Enable **Email provider** (turn ON)
  - [ ] Enable **Confirm email** (turn ON)
  - [ ] Enable **Double confirm change** (optional)
- [ ] Click **Save**

### Email Templates (Optional - Verify)
- [ ] Go to: https://app.supabase.com/project/[PROJECT_ID]/auth/email-templates
- [ ] Verify **Confirm signup** template exists
- [ ] Template should include: `{{ .ConfirmationLink }}`
- [ ] Default template should work fine

---

## 🧪 Local Testing (Test Development Environment)

### Setup
- [ ] Run: `npm run dev`
- [ ] Application should start at: `http://localhost:3000`

### Test Signup
- [ ] Go to: `http://localhost:3000/register`
- [ ] Fill form:
  - Full Name: "Test User"
  - Email: "testuser@example.com" (or your test email)
  - Password: "SecurePassword123!"
- [ ] Click "Create account"

### Verify Signup Created User
- [ ] Go to Supabase Dashboard: https://app.supabase.com/project/[PROJECT_ID]/auth/users
- [ ] Look for new user with email you just used
- [ ] Check: `email_confirmed` should be `FALSE` ⬅️ This is correct!
- [ ] Status should be: `Not confirmed`

### Check Email Confirmation
- [ ] Check your email inbox (and spam folder)
- [ ] Look for email from: `noreply@supabase.io`
- [ ] Subject should be: "Confirm your signup"
- [ ] **If not received**:
  - [ ] Check spam/junk folder
  - [ ] Check Supabase logs for email send errors
  - [ ] Verify Supabase Email provider is enabled

### Click Email Link
- [ ] Open the confirmation email
- [ ] Click the confirmation link
- [ ] Browser should redirect to: `http://localhost:3000/dashboard`
- [ ] You should be logged in ✅
- [ ] Check localStorage should have: `supabase.auth.token`

### Verify User Confirmed
- [ ] Go back to Supabase Users
- [ ] Refresh the page
- [ ] Check user's `email_confirmed` should now be `TRUE` ✅
- [ ] Status should be: `Confirmed`

### Test Persistence
- [ ] Refresh the dashboard page
- [ ] You should still be logged in ✅
- [ ] Close and reopen browser → should still be logged in ✅

---

## 🚀 Deployment (After Local Testing Works)

### Pre-Deployment
- [ ] All local tests pass ✅
- [ ] No build errors: `npm run build` ✅
- [ ] Code committed to GitHub
- [ ] Vercel environment variables set (if needed)

### Deployment
- [ ] Push to GitHub main branch
- [ ] Vercel auto-deploys
- [ ] Wait for deployment to complete
- [ ] Deployment should appear at: https://dukaanify-jler.vercel.app

### Post-Deployment Verification
- [ ] Go to: https://dukaanify-jler.vercel.app/register
- [ ] Sign up with new test email
- [ ] Verify you receive confirmation email within 1 minute
- [ ] Click link in email
- [ ] Should redirect to: https://dukaanify-jler.vercel.app/dashboard
- [ ] Should be logged in ✅

---

## 🔍 Troubleshooting

### Problem: Email Not Received
- [ ] Check spam/junk folder
- [ ] Verify Supabase Email provider is ENABLED
- [ ] Check Supabase logs for errors: https://app.supabase.com/project/[PROJECT_ID]/logs
- [ ] Try different email address
- [ ] Wait 1-2 minutes (sometimes slow)

**Solution**: See `SUPABASE_AUTH_SETUP.md` → Troubleshooting section

### Problem: Email Link Shows "error=auth_callback_failed"
- [ ] Redirect URL not added to Supabase
- [ ] Add `https://dukaanify-jler.vercel.app/api/auth/callback` to Supabase redirect URLs
- [ ] Clear browser cache
- [ ] Try again

### Problem: Click Email Link But Not Logged In
- [ ] Check browser console for errors
- [ ] Verify localStorage has `supabase.auth.token`
- [ ] Try in incognito/private mode
- [ ] Check Supabase dashboard for session errors

### Problem: Works Locally But Not Production
- [ ] Supabase redirect URLs not configured for production domain
- [ ] Site URL not set to production domain
- [ ] Environment variables not deployed correctly
- [ ] Verify Vercel environment variables are set

**Solution**: See `SUPABASE_AUTH_SETUP.md` → Troubleshooting section

---

## 📋 Important Information

**Supabase Project ID**: `iprvwdsniwmspdmewzbs`  
**Deployed App URL**: `https://dukaanify-jler.vercel.app`  
**Local Dev URL**: `http://localhost:3000`  
**Callback URL**: `[YOUR_DOMAIN]/api/auth/callback`

---

## 📚 Documentation Reference

Read these in order:
1. **SUPABASE_AUTH_SETUP.md** - Setup instructions (MOST IMPORTANT)
2. **AUTH_FLOW_DIAGRAM.md** - Visual explanations
3. **EMAIL_CONFIRMATION_FIX.md** - What was fixed
4. **CHANGES_SUMMARY.md** - Code changes summary

---

## ✅ Final Verification

- [ ] Supabase configured with correct redirect URLs
- [ ] Email provider enabled in Supabase
- [ ] Local signup flow works ✅
- [ ] Local email confirmation works ✅
- [ ] Code committed to GitHub
- [ ] Deployed to Vercel
- [ ] Production signup works ✅
- [ ] Production email confirmation works ✅

**ALL DONE!** 🎉

---

## Quick Links

- Supabase Dashboard: https://app.supabase.com/
- Vercel Dashboard: https://vercel.com/
- GitHub Repository: [Your GitHub URL]
- Deployed App: https://dukaanify-jler.vercel.app

---

**Last Updated**: June 9, 2026  
**Status**: Ready for implementation ✅
