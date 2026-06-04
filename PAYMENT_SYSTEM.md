# Manual Payment System Implementation

## Overview
This document describes the manual payment system added to Dukaanify for handling plan upgrades through manual payment verification.

## Features Implemented

### 1. Payment Request Database Table
- **File**: `supabase/migrations/004_payment_requests.sql`
- **Table**: `payment_requests`
- **Fields**:
  - `id`: UUID primary key
  - `user_id`: Reference to user profile
  - `plan_id`: Selected plan identifier
  - `plan_name`: Plan name (e.g., "Growth")
  - `plan_price`: Plan price (e.g., "PKR 7,000")
  - `payment_method`: Payment method used (jazzcash, easypaisa, bank)
  - `transaction_id`: User's transaction reference number
  - `screenshot_url`: Base64 encoded payment screenshot
  - `status`: pending | approved | rejected
  - `admin_notes`: Admin's notes on approval/rejection
  - `created_at`, `updated_at`: Timestamps

### 2. User-Facing Components

#### PaymentForm Component
- **File**: `components/dashboard/PaymentForm.tsx`
- **Features**:
  - Two-step form: Select payment method → Upload details
  - Accepts transaction ID and payment screenshot
  - Converts image to base64 for storage
  - Shows success message after submission
  - File size validation (max 5MB)

#### Updated UpgradePlans Component
- **File**: `components/dashboard/UpgradePlans.tsx`
- **Changes**:
  - Added "Submit Payment Screenshot" button when plan is selected
  - Integrated PaymentForm component
  - Maintains existing WhatsApp option as fallback
  - Clean UI with form toggle

### 3. Admin Panel

#### Admin Payments Page
- **File**: `app/admin/payments/page.tsx`
- **Features**:
  - Dashboard with payment request statistics
  - Stats cards: Total, Pending, Approved, Rejected
  - Sidebar navigation
  - Access control (admin only)

#### Payment Requests Table Component
- **File**: `components/admin/PaymentRequestsTable.tsx`
- **Features**:
  - Displays all payment requests in a table
  - Expandable rows to view payment screenshot
  - Admin notes textarea for approval/rejection
  - Approve/Reject buttons for pending requests
  - Status badges with color coding
  - Shows user email and plan details

### 4. Server Actions

#### Payment Actions
- **File**: `lib/actions/payment.ts`
- **Functions**:
  - `submitPaymentRequest()`: User submits payment request
  - `getPaymentRequests()`: User views their own requests
  - `getAllPaymentRequests()`: Admin views all requests
  - `approvePaymentRequest()`: Admin approves payment
  - `rejectPaymentRequest()`: Admin rejects payment

### 5. Data Models

#### Updated Types
- **File**: `types/models.ts`
- **New Type**: `PaymentRequest` interface
- **New Type**: `PaymentRequestStatus` type

#### Updated Database Types
- **File**: `types/database.ts`
- **Added**: `payment_requests` table definition

## User Flow

1. User clicks "Upgrade Plan" on dashboard
2. User selects a plan (Starter, Growth, Pro)
3. User clicks "Submit Payment Screenshot"
4. Payment form opens with two steps:
   - Step 1: Select payment method (JazzCash, Easypaisa, Bank)
   - Step 2: Enter transaction ID and upload screenshot
5. Form submits payment request to database
6. User sees success message
7. Admin reviews payment request in admin panel
8. Admin approves/rejects with optional notes
9. On approval, user's plan is upgraded (manual process for now)

## Admin Flow

1. Admin navigates to `/admin/payments`
2. Views dashboard with payment statistics
3. Sees table of all payment requests
4. Clicks "View" to expand a request
5. Reviews payment screenshot
6. Adds admin notes if needed
7. Clicks "Approve" or "Reject"
8. Request status updates in database

## Database Setup

Run the migration to create the payment_requests table:

```sql
-- Run this in Supabase SQL editor
-- File: supabase/migrations/004_payment_requests.sql
```

## Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Considerations

1. **Row Level Security (RLS)**:
   - Users can only view/insert their own payment requests
   - Admin access via service role key

2. **File Validation**:
   - Max file size: 5MB
   - Accepted formats: Image files only
   - Stored as base64 in database

3. **Admin Access**:
   - Protected by `isAdmin()` check
   - Uses service role for admin operations

## Future Enhancements

1. **Automatic Plan Upgrade**: Trigger plan upgrade on approval
2. **Email Notifications**: Notify user on approval/rejection
3. **Payment Proof Storage**: Store screenshots in Supabase Storage instead of base64
4. **Bulk Actions**: Admin can approve/reject multiple requests
5. **Payment Tracking**: Track payment history per user
6. **Refund System**: Handle rejected payments and refunds
7. **Webhook Integration**: Connect to payment gateway webhooks

## Testing Checklist

- [ ] User can submit payment request
- [ ] Payment form validates inputs
- [ ] Screenshot upload works
- [ ] Admin can view all payment requests
- [ ] Admin can approve payment request
- [ ] Admin can reject payment request
- [ ] Admin notes are saved
- [ ] Status updates reflect in UI
- [ ] RLS policies work correctly
- [ ] Non-admin users cannot access admin panel

## Files Modified/Created

### Created:
- `supabase/migrations/004_payment_requests.sql`
- `lib/actions/payment.ts`
- `components/dashboard/PaymentForm.tsx`
- `components/admin/PaymentRequestsTable.tsx`
- `app/admin/payments/page.tsx`

### Modified:
- `components/dashboard/UpgradePlans.tsx`
- `types/models.ts`
- `types/database.ts`
- `app/admin/page.tsx` (added CreditCardIcon)

## Deployment Notes

1. Run database migration before deploying
2. Ensure service role key is set in environment
3. Test admin access with test admin account
4. Verify RLS policies are working
5. Test file upload with various image sizes
