# RBAC Quick Reference

## Check User Role

```typescript
import { isAdmin, getCurrentUser } from '@/lib/utils/auth'

// Check if admin
const user = await getCurrentUser()
if (isAdmin(user?.email)) {
  // Admin-only code
}

// Check if owns business
const business = await getOwnedBusiness(businessSlug)
if (!business) {
  // User doesn't own this business
  notFound()
}
```

## Protect a Route

### Option 1: Layout Component (Recommended)
```typescript
// app/(dashboard)/[businessSlug]/layout.tsx
export default async function Layout({ children, params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .eq('owner_id', user.id)
    .single()

  if (!business) notFound()

  return <>{children}</>
}
```

### Option 2: Page Component
```typescript
// app/(dashboard)/[businessSlug]/products/page.tsx
export default async function ProductsPage({ params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', businessSlug)
    .eq('owner_id', user.id)
    .single()

  if (!business) notFound()

  // Render page
}
```

### Option 3: Admin-Only Route
```typescript
// app/admin/page.tsx
import { isAdmin } from '@/lib/utils/auth'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) redirect('/dashboard')

  // Admin-only content
}
```

## Query with Tenant Isolation

```typescript
// Always filter by business_id
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('business_id', businessId)  // ← Tenant isolation
  .order('created_at', { ascending: false })
```

## Server Action with Access Check

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { getOwnedBusinessById } from '@/lib/utils/auth'

export async function updateProduct(
  businessId: string,
  productId: string,
  data: ProductData
) {
  // Verify ownership
  const business = await getOwnedBusinessById(businessId)
  if (!business) {
    return { error: 'Not authorized' }
  }

  // Update product
  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', productId)
    .eq('business_id', businessId)  // ← Tenant isolation

  if (error) return { error: error.message }
  return { success: true }
}
```

## Access Control Helpers

```typescript
import { 
  checkBusinessAccess,
  checkAdminAccess,
  checkBusinessOwnership 
} from '@/lib/middleware/access-control'

// Check business access (owner or admin)
const { allowed, business } = await checkBusinessAccess(businessSlug)
if (!allowed) notFound()

// Check admin access
const { allowed } = await checkAdminAccess()
if (!allowed) redirect('/dashboard')

// Check business ownership
const { allowed } = await checkBusinessOwnership(businessId)
if (!allowed) return { error: 'Not authorized' }
```

## Route Protection Summary

| Route | Auth Required | Owner Only | Admin Only |
|-------|---------------|-----------|-----------|
| `/` | ❌ | ❌ | ❌ |
| `/login` | ❌ | ❌ | ❌ |
| `/store/[slug]` | ❌ | ❌ | ❌ |
| `/dashboard` | ✅ | ❌ | ❌ |
| `/[slug]/products` | ✅ | ✅ | ✅ |
| `/[slug]/orders` | ✅ | ✅ | ✅ |
| `/[slug]/customers` | ✅ | ✅ | ✅ |
| `/[slug]/settings` | ✅ | ✅ | ✅ |
| `/admin` | ✅ | ❌ | ✅ |
| `/admin/payments` | ✅ | ❌ | ✅ |

## Common Patterns

### Verify Business Ownership in Server Action
```typescript
async function getOwnedBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  return business
}
```

### Fetch User's Businesses
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('owner_id', user.id)
  .order('created_at', { ascending: false })
```

### Admin Fetches All Businesses
```typescript
import { createClient as createServiceClient } from '@supabase/supabase-js'

const service = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data: allBusinesses } = await service
  .from('businesses')
  .select('*')
  .order('created_at', { ascending: false })
```

## Debugging

### Check if User is Admin
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('User email:', user?.email)
console.log('Admin email:', process.env.ADMIN_EMAIL)
console.log('Is admin:', isAdmin(user?.email))
```

### Check Business Ownership
```typescript
const { data: business } = await supabase
  .from('businesses')
  .select('id, owner_id, slug')
  .eq('slug', businessSlug)
  .single()

console.log('Business owner_id:', business?.owner_id)
console.log('User id:', user?.id)
console.log('Owns business:', business?.owner_id === user?.id)
```

### Check RLS Policies
```sql
-- View RLS policies on a table
SELECT * FROM pg_policies WHERE tablename = 'businesses';

-- Check if RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'businesses';
```

## Environment Setup

```env
# .env.local
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Files to Know

| File | Purpose |
|------|---------|
| `lib/utils/auth.ts` | Auth utilities (isAdmin, getOwnedBusiness, etc.) |
| `lib/middleware/access-control.ts` | Access control helpers |
| `proxy.ts` | Middleware routing and protection |
| `app/(dashboard)/[businessSlug]/layout.tsx` | Business ownership verification |
| `app/admin/page.tsx` | Admin dashboard (admin-only) |
| `RBAC_GUIDE.md` | Comprehensive RBAC documentation |
| `RBAC_IMPLEMENTATION.md` | Implementation details and changes |

## Key Principles

1. **Always verify ownership** - Never trust client-side role information
2. **Filter by business_id** - All queries must be scoped to the business
3. **Use server components** - Access checks must happen on the server
4. **Multi-layer protection** - Middleware → Page → Database
5. **Fail securely** - Return 404 or redirect, never expose data
