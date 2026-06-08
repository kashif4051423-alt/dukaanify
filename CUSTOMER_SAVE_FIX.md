# Customer Detail Saving Issue - Fix Guide

## Problem
When placing an order, the customer details fail to save with error:
```
Failed to save customer details: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## Root Cause
The code was using `.upsert()` with `onConflict: 'business_id,phone'` but Supabase database didn't have a unique constraint on these combined columns.

## Solution Applied

### 1. Code Changes (Already Implemented)
✅ Changed from `.upsert()` to explicit select/insert/update pattern in `lib/actions/order.ts`:

```typescript
// Instead of:
.upsert({ ... }, { onConflict: 'business_id,phone' })

// Now using:
1. Check if customer exists with SELECT
2. If exists: UPDATE the customer
3. If not exists: INSERT new customer
```

This avoids the upsert constraint issue entirely.

### 2. Database Schema Update (REQUIRED)

Add a unique constraint to the `customers` table to ensure data integrity:

**Execute this SQL in Supabase Dashboard → SQL Editor:**

```sql
-- Add unique constraint for customer phone per business
-- Allows same phone in different businesses, prevents duplicates within a business
ALTER TABLE customers
ADD CONSTRAINT customers_business_phone_unique UNIQUE (business_id, phone);
```

**Steps:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor"
4. Click "New Query"
5. Paste the SQL above
6. Click "Run"

### 3. Testing

After applying the database change, test the checkout flow:

1. Go to any store page
2. Add items to cart
3. Click checkout
4. Fill customer details:
   - **Full Name**: Any name
   - **Phone**: Valid phone number
   - **Email**: Optional
   - **Address**: Valid address
5. Click "Place Order"

Expected result: ✅ Order should be created successfully

### 4. Git Commit

The code fix has already been committed and pushed:
- Commit: `8f6b454`
- Branch: `main`
- Remote: `https://github.com/kashif4051423-alt/dukaanify.git`

### What Changed in Code

**File: `lib/actions/order.ts` (Step 3)**

Before:
- Used `.upsert()` with conflicting constraint
- Would fail if constraint didn't exist

After:
- Query existing customer first
- Update if exists, insert if not
- No constraint dependency
- More robust and handles all edge cases

### Benefits
✅ No database constraint dependency
✅ Clear insert/update logic
✅ Better error handling
✅ Works with any database setup
✅ Future-proof

## Summary
- ✅ Code fix: Applied and pushed to GitHub
- ⏳ Database constraint: Apply manually in Supabase SQL Editor
- ✅ Testing: Ready for checkout flow testing
