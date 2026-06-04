# Role-Based Access Control (RBAC) Guide

## Overview

This multi-tenant SaaS implements a two-tier role-based access control system:

1. **Business Owners** - Can manage their own businesses (products, orders, customers)
2. **Admins** - Can manage the entire platform (all businesses, payments, users)
3. **Customers** - Can only access the public storefront

## Architecture

### Authentication Flow

```
User Login → Supabase Auth → Session Created → Middleware Check
                                                    ↓
                                    Route Protection & Role Verification
```

### Access Control Layers

1. **Middleware Layer** (`proxy.ts`)
   - Redirects unauthenticated users to login
   - Protects dashboard and admin routes
   - Allows public store access

2. **Page/Layout Layer** (Server Components)
   - Verifies business ownership before rendering
   - Returns 404 if user doesn't own the business
   - Prevents unauthorized access to dashboard

3. **Database Layer** (RLS Policies)
   - Enforces tenant isolation at database level
   - Prevents cross-tenant data access
   - Allows public read access to active stores

## User Roles

### Business Owner
- **Identification**: User who created the business (stored in `businesses.owner_id`)
- **Access**:
  - ✅ Dashboard (`/dashboard`)
  - ✅ Their own business dashboard (`/[businessSlug]/*`)
  - ✅ Products management
  - ✅ Orders management
  - ✅ Customers view
  - ✅ Settings
  - ✅ Public storefront (read-only)
  - ❌ Admin panel
  - ❌ Other businesses' dashboards

### Admin
- **Identification**: Email matches `ADMIN_EMAIL` environment variable
- **Access**:
  - ✅ All business owner features
  - ✅ Admin panel (`/admin`)
  - ✅ Payment requests management
  - ✅ Client management
  - ✅ Platform overview
  - ✅ Any business dashboard (for support)

### Customer (Unauthenticated)
- **Access**:
  - ✅ Public storefront (`/store/[slug]`)
  - ✅ Browse products
  - ✅ Place orders
  - ✅ Checkout
  - ❌ Dashboard
  - ❌ Admin panel
  - ❌ Business management

## Route Protection

### Public Routes (No Auth Required)
```
/                          - Landing page
/login                     - Login page
/register                  - Registration page
/forgot-password           - Password recovery
/reset-password            - Password reset
/store/[slug]              - Public storefront
/pricing                   - Pricing page
```

### Protected Routes (Auth Required)
```
/dashboard                 - Business list
/dashboard/new-business    - Create business
/[businessSlug]/*          - Business dashboard
  - /products              - Product management
  - /orders                - Order management
  - /customers             - Customer list
  - /settings              - Business settings
```

### Admin Routes (Admin Only)
```
/admin                     - Admin dashboard
/admin/payments            - Payment requests
/admin/client/[userId]     - Client details
```

## Multi-Tenant Safety

### Business Isolation

1. **Query-Level Filtering**
   ```typescript
   // All queries filter by business_id
   const { data: products } = await supabase
     .from('products')
     .select('*')
     .eq('business_id', businessId)  // ← Tenant isolation
   ```

2. **Ownership Verification**
   ```typescript
   // Verify user owns the business
   const { data: business } = await supabase
     .from('businesses')
     .select('*')
     .eq('slug', businessSlug)
     .eq('owner_id', user.id)  // ← Ownership check
     .single()
   ```

3. **Database RLS Policies**
   ```sql
   -- Authenticated users can only see their own businesses
   create policy "businesses: owner read"
     on public.businesses
     for select
     to authenticated
     using (owner_id = auth.uid());
   ```

### Data Separation

- Each business has a unique `id` (UUID)
- All related data (products, orders, customers) references `business_id`
- Foreign key constraints prevent orphaned data
- Cascade deletes ensure data cleanup

## Implementation Details

### Key Files

- **`lib/utils/auth.ts`** - Authentication utilities
  - `isAdmin(email)` - Check if user is admin
  - `getOwnedBusiness(slug)` - Get business if owned
  - `getOwnedBusinessById(id)` - Get business by ID if owned
  - `getCurrentUser()` - Get current authenticated user

- **`lib/middleware/access-control.ts`** - Access control helpers
  - `checkBusinessAccess(slug)` - Verify business access
  - `checkAdminAccess()` - Verify admin access
  - `checkBusinessOwnership(id)` - Verify business ownership

- **`proxy.ts`** - Middleware routing
  - Protects dashboard and admin routes
  - Redirects unauthenticated users to login
  - Allows public store access

- **`app/(dashboard)/[businessSlug]/layout.tsx`** - Business layout
  - Verifies ownership before rendering
  - Returns 404 if not authorized

### Environment Variables

```env
# Admin email (single admin)
ADMIN_EMAIL=admin@example.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Security Best Practices

### ✅ Implemented

1. **Server-Side Verification**
   - All access checks happen on the server
   - No client-side role checking
   - Session verified on every request

2. **Multi-Layer Protection**
   - Middleware → Page/Layout → Database
   - Defense in depth approach
   - Multiple verification points

3. **Tenant Isolation**
   - Database-level RLS policies
   - Query-level filtering
   - Ownership verification

4. **Admin Separation**
   - Admin routes protected at middleware level
   - Admin email-based identification
   - Service role key for elevated operations

### ⚠️ Considerations

1. **Single Admin**
   - Currently supports one admin via `ADMIN_EMAIL`
   - Consider implementing admin management UI for multiple admins

2. **Session Management**
   - Sessions refresh on every request
   - No explicit timeout handling
   - Consider adding session timeout for security

3. **Audit Logging**
   - No audit logs for sensitive operations
   - Consider adding logging for compliance

4. **Rate Limiting**
   - No rate limiting on public checkout
   - Consider adding rate limiting for abuse prevention

## Testing Access Control

### Test Business Owner Access
```bash
# 1. Register as user@example.com
# 2. Create a business
# 3. Access /[businessSlug]/products
# ✅ Should see products
# 4. Try accessing another user's business
# ❌ Should see 404
```

### Test Admin Access
```bash
# 1. Set ADMIN_EMAIL=admin@example.com
# 2. Register as admin@example.com
# 3. Access /admin
# ✅ Should see admin dashboard
# 4. Access any business dashboard
# ✅ Should see all businesses
```

### Test Customer Access
```bash
# 1. Visit /store/[slug] without logging in
# ✅ Should see storefront
# 2. Try accessing /dashboard
# ❌ Should redirect to login
# 3. Try accessing /admin
# ❌ Should redirect to login
```

## Troubleshooting

### User Can't Access Their Business
1. Verify `owner_id` in database matches user ID
2. Check middleware is allowing authenticated users
3. Verify business `is_active` is true
4. Check RLS policies are enabled

### Admin Can't Access Admin Panel
1. Verify `ADMIN_EMAIL` environment variable is set
2. Check user email matches exactly (case-insensitive)
3. Verify admin user is authenticated
4. Check middleware allows `/admin` routes

### Cross-Tenant Data Leakage
1. Verify all queries filter by `business_id`
2. Check RLS policies are enabled on all tables
3. Verify ownership checks in page layouts
4. Review database logs for unauthorized access

## Future Enhancements

1. **Role-Based Permissions**
   - Add granular permissions (view, edit, delete)
   - Support team members with different roles
   - Implement permission inheritance

2. **Admin Management**
   - Support multiple admins
   - Admin role management UI
   - Audit log for admin actions

3. **Session Management**
   - Explicit session timeout
   - Device management
   - Login history

4. **Security Enhancements**
   - Two-factor authentication
   - IP whitelisting
   - Rate limiting
   - Audit logging
