# Dukaanify Authentication Flow Diagram

## Complete Auth Flow with Email Confirmation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SIGNUP & EMAIL CONFIRMATION FLOW                     │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: USER SIGNUP
═══════════════════

Browser (http://localhost:3000/register)
        │
        │ User fills form:
        │ - Full Name
        │ - Email
        │ - Password (min 8 chars)
        │
        ▼
   RegisterForm Component
        │
        │ onClick="handleSubmit"
        │
        ▼
   supabase.auth.signUp({
     email,
     password,
     options: {
       data: { full_name: fullName },
       emailRedirectTo: "https://dukaanify-jler.vercel.app/api/auth/callback"
              ↓ (or http://localhost:3000 in dev)
     }
   })
        │
        ▼
   Supabase Backend
        │
        ├─ Creates user in auth.users table
        ├─ Sets email_confirmed = false
        ├─ Generates confirmation token
        └─ Sends confirmation email with link:
           
           From: noreply@supabase.io
           To: user@email.com
           Subject: Confirm your signup
           
           Link: https://[YOUR_DOMAIN]/api/auth/callback?
                 code=[TOKEN]&type=signup


STEP 2: USER RECEIVES EMAIL & CLICKS LINK
═══════════════════════════════════════════

User's Mailbox
    │
    │ User reads email
    │ Clicks confirmation link
    │
    ▼
Browser navigates to:
https://dukaanify-jler.vercel.app/api/auth/callback?code=AUTH_TOKEN&type=signup
    │
    ▼
App Route Handler: /api/auth/callback/route.ts
    │
    ├─ Extracts params:
    │  - code = AUTH_TOKEN
    │  - type = "signup"
    │  - next = "/dashboard" (default)
    │
    ▼
supabase.auth.exchangeCodeForSession(code)
    │
    ├─ Validates token
    ├─ Creates JWT session
    ├─ Sets user.email_confirmed = true
    └─ Returns session with access_token
    │
    ▼
if (!error) {
  if (type === 'recovery') {
    redirect to /reset-password
  } else {
    redirect to /dashboard  ← MAIN FLOW
  }
}
    │
    ▼
Browser redirects to:
https://dukaanify-jler.vercel.app/dashboard
    │
    ▼
Dashboard Layout checks:
const session = await getSession()
    │
    ├─ If NO session → redirect to /login
    └─ If YES session → render dashboard ✅
    │
    ▼
USER IS LOGGED IN ✅


STEP 3: SESSION PERSISTENCE
════════════════════════════

After email confirmation, user's browser has:
┌─────────────────────────────────────┐
│ Browser localStorage:               │
├─────────────────────────────────────┤
│ supabase.auth.token: {              │
│   access_token: "eyJhbGc..."        │
│   refresh_token: "xxx..."           │
│   expires_at: 1234567890            │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
Next time user visits app:
- Supabase client reads token from localStorage
- Validates token with Supabase backend
- Restores session automatically
- User stays logged in ✅


═══════════════════════════════════════════════════════════════════════════════
                              KEY FILES & FLOWS
═══════════════════════════════════════════════════════════════════════════════

1. SIGNUP PAGE
   Location: app/(auth)/register/page.tsx
   Component: RegisterForm (components/auth/RegisterForm.tsx)
   
   Flow:
   Register Page → RegisterForm Component → supabase.auth.signUp()
                                                    ↓
                                            Confirmation Email Sent

2. EMAIL CONFIRMATION CALLBACK
   Location: app/api/auth/callback/route.ts
   
   Flow:
   Email Link Clicked → /api/auth/callback?code=TOKEN
                            ↓
                   exchangeCodeForSession(TOKEN)
                            ↓
                   Redirect to /dashboard

3. DASHBOARD LOGIN CHECK
   Location: app/(dashboard)/layout.tsx (or middleware)
   
   Flow:
   Check Session → If logged in → Show Dashboard
                → If not logged in → Redirect to /login

4. SUPABASE CLIENT
   Location: lib/supabase/client.ts
   
   Creates browser client for auth operations


═══════════════════════════════════════════════════════════════════════════════
                        SUPABASE CONFIGURATION REQUIRED
═══════════════════════════════════════════════════════════════════════════════

Dashboard: https://app.supabase.com/project/[PROJECT_ID]/auth/url-configuration

Must Configure:
┌─────────────────────────────────────────────────────────────┐
│ Site URL: https://dukaanify-jler.vercel.app                │
│                                                              │
│ Redirect URLs:                                              │
│ • https://dukaanify-jler.vercel.app/api/auth/callback     │
│ • https://dukaanify-jler.vercel.app/dashboard             │
│ • http://localhost:3000/api/auth/callback (dev)           │
│ • http://localhost:3000/dashboard (dev)                   │
│                                                              │
│ Email Provider: ENABLED ✓                                  │
│ Confirm Email: ENABLED ✓                                  │
└─────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                             ERROR SCENARIOS
═══════════════════════════════════════════════════════════════════════════════

ERROR: User not receiving confirmation email
↓
Cause: Email provider not enabled in Supabase
Solution: Enable in Supabase → Authentication → Providers → Email

ERROR: Email link shows "error=auth_callback_failed"
↓
Cause: Redirect URL not in Supabase whitelist
Solution: Add to Supabase → URL Configuration → Redirect URLs

ERROR: After clicking email, user not logged in
↓
Cause: Session not being created or restored
Solution: Check browser console, verify localStorage has token

ERROR: Link works locally but not in production
↓
Cause: Supabase not configured for Vercel domain
Solution: Add production URLs to Supabase, set correct Site URL


═══════════════════════════════════════════════════════════════════════════════
                            CODE SNIPPETS
═══════════════════════════════════════════════════════════════════════════════

RegisterForm.tsx - Signup:
```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
    emailRedirectTo: `${window.location.origin}/api/auth/callback`,
  },
})
```

route.ts - Email Confirmation Callback:
```typescript
const code = searchParams.get('code')
const { error } = await supabase.auth.exchangeCodeForSession(code)

if (!error) {
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

Dashboard - Check Session:
```typescript
const session = await getSession()
if (!session) {
  redirect('/login')
}
```
