# Payment System Setup Guide

## Quick Start

### 1. Run Database Migration

Copy and run this SQL in your Supabase SQL editor:

```sql
-- Payment requests table for manual payment system
create table public.payment_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  plan_id     text not null,
  plan_name   text not null,
  plan_price  text not null,
  payment_method text not null,
  transaction_id text not null,
  screenshot_url text not null,
  status      text not null default 'pending',
  admin_notes text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index payment_requests_user_id_idx on public.payment_requests(user_id);
create index payment_requests_status_idx on public.payment_requests(status);

-- Enable RLS
alter table public.payment_requests enable row level security;

-- Users can view their own payment requests
create policy "payment_requests: user access" on public.payment_requests
  for select using (auth.uid() = user_id);

-- Users can insert their own payment requests
create policy "payment_requests: user insert" on public.payment_requests
  for insert with check (auth.uid() = user_id);
```

### 2. Verify Files Are in Place

Check these files exist:
- ✅ `lib/actions/payment.ts` - Server actions
- ✅ `components/dashboard/PaymentForm.tsx` - Payment form
- ✅ `components/admin/PaymentRequestsTable.tsx` - Admin table
- ✅ `app/admin/payments/page.tsx` - Admin page
- ✅ `supabase/migrations/004_payment_requests.sql` - Migration

### 3. Test the Feature

**User Side:**
1. Go to `/dashboard`
2. Click "Upgrade Plan" (if you've used your free slot)
3. Select a plan
4. Click "Submit Payment Screenshot"
5. Fill in transaction ID and upload a test image
6. Submit

**Admin Side:**
1. Go to `/admin/payments`
2. You should see the payment request in the table
3. Click "View" to expand
4. Review the screenshot
5. Add notes if needed
6. Click "Approve" or "Reject"

### 4. Customize Payment Methods

Edit `components/dashboard/PaymentForm.tsx` and `components/dashboard/UpgradePlans.tsx` to change:
- Payment method names
- Payment account numbers
- Payment instructions

Current methods:
- 🔴 JazzCash: 03269415471
- 🟢 Easypaisa: 03269415471
- 🏦 Allied Bank: 53670020131980570017

### 5. Admin Access

Make sure your admin email is in the `isAdmin()` function:

Check `lib/utils/admin.ts` and add your email if needed.

## Features

✅ Users submit payment screenshots with transaction ID
✅ Admin reviews and approves/rejects payments
✅ Payment status tracking (pending/approved/rejected)
✅ Admin notes for each payment
✅ Clean, modern UI
✅ Mobile responsive
✅ File validation (max 5MB)
✅ Base64 image storage

## Next Steps (Optional)

1. **Auto-upgrade on approval**: Modify `approvePaymentRequest()` to automatically upgrade user's plan
2. **Email notifications**: Send email to user when payment is approved/rejected
3. **Cloud storage**: Store screenshots in Supabase Storage instead of base64
4. **Payment history**: Add page to view past payments
5. **Refund system**: Handle rejected payments

## Troubleshooting

**"Cannot find module" error:**
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

**Admin page shows 403:**
- Check your email is in `isAdmin()` function
- Verify service role key is set

**Payment form not showing:**
- Make sure you've selected a plan first
- Check browser console for errors

**Screenshot not uploading:**
- Check file size (max 5MB)
- Try a different image format (PNG/JPG)
- Check browser console for errors

## Support

For issues or questions, check:
- `PAYMENT_SYSTEM.md` - Full documentation
- `lib/actions/payment.ts` - Server logic
- `components/dashboard/PaymentForm.tsx` - Form logic
