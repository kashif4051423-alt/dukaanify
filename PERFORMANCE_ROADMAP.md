# 📋 PERFORMANCE OPTIMIZATION ROADMAP

## Week 1: Critical Fixes (Expected: 60% improvement)

### Day 1-2: Pagination & ISR
- [ ] Add pagination to orders page (20 items per page)
- [ ] Add pagination to customers page (50 items per page)
- [ ] Enable ISR on dashboard overview (revalidate: 3600)
- [ ] Enable ISR on store pages (revalidate: 1800)
- **Expected Impact**: Dashboard 8-10s → 2-3s

### Day 3-4: Image Optimization
- [ ] Replace `<img>` with `<Image>` in DashboardNav
- [ ] Optimize hero banner image (use Next.js Image)
- [ ] Add responsive image sizes to all product images
- [ ] Enable WebP format in next.config.ts
- **Expected Impact**: Image load time -50%

### Day 5: Memoization
- [ ] Memoize DashboardNav component
- [ ] Memoize ProductCard component
- [ ] Memoize RevenueChart component
- [ ] Add Zustand selectors
- **Expected Impact**: Navigation 2-3s → 0.5-1s

---

## Week 2: High Impact Fixes (Expected: 30% additional improvement)

### Day 1-2: Component Splitting
- [ ] Split StorefrontShell into server + client
- [ ] Create ProductGrid server component
- [ ] Create StorefrontClient client component
- [ ] Update store page to use new components
- **Expected Impact**: Store page FCP 4-6s → 1-2s

### Day 3-4: Caching & Headers
- [ ] Add Cache-Control headers for store pages
- [ ] Add Cache-Control headers for API routes
- [ ] Configure CDN caching
- [ ] Add ETag headers
- **Expected Impact**: Repeat visits 50% faster

### Day 5: Error Handling
- [ ] Create ErrorBoundary component
- [ ] Wrap critical components with ErrorBoundary
- [ ] Add loading states to all pages
- [ ] Add error states to all pages
- **Expected Impact**: Better UX, no blank pages

---

## Week 3: Mobile & Bundle Optimization (Expected: 10% additional improvement)

### Day 1-2: Mobile Responsiveness
- [ ] Improve sidebar width on mobile
- [ ] Improve product grid spacing
- [ ] Improve checkout modal on mobile
- [ ] Test on actual mobile devices
- **Expected Impact**: Mobile TTI 15-20s → 4-5s

### Day 3-4: Bundle Size
- [ ] Analyze bundle with `next/bundle-analyzer`
- [ ] Remove unused dependencies
- [ ] Enable compression in next.config.ts
- [ ] Code split large components
- **Expected Impact**: Bundle size -30%

### Day 5: Performance Monitoring
- [ ] Set up Sentry for error tracking
- [ ] Set up LogRocket for session replay
- [ ] Set up Web Vitals monitoring
- [ ] Create performance dashboard
- **Expected Impact**: Real-time performance insights

---

## Implementation Priority Matrix

```
HIGH IMPACT + EASY
├─ Add pagination (2 hours)
├─ Enable ISR (1 hour)
├─ Memoize components (3 hours)
├─ Optimize images (2 hours)
└─ Add caching headers (1 hour)

HIGH IMPACT + MEDIUM
├─ Split StorefrontShell (4 hours)
├─ Add error boundaries (2 hours)
└─ Mobile responsiveness (3 hours)

MEDIUM IMPACT + EASY
├─ Zustand selectors (1 hour)
├─ RevenueChart memoization (1 hour)
└─ Compression (30 minutes)

MEDIUM IMPACT + MEDIUM
├─ Bundle analysis (2 hours)
├─ Performance monitoring (3 hours)
└─ Mobile testing (2 hours)
```

---

## Detailed Implementation Steps

### STEP 1: Add Pagination to Orders Page

**File**: `app/(dashboard)/[businessSlug]/orders/page.tsx`

```typescript
interface Props {
  params: Promise<{ businessSlug: string }>
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function OrdersPage({ params, searchParams }: Props) {
  const { businessSlug } = await params
  const { status: statusFilter, page: pageStr } = await searchParams
  
  const pageSize = 20
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, currency')
    .eq('slug', businessSlug)
    .eq('owner_id', user!.id)
    .single()

  if (!business) notFound()

  // ✅ Add count and range
  let query = supabase
    .from('orders')
    .select(`
      id, 
      status, 
      total_amount, 
      created_at, 
      notes, 
      customers(name, email, phone, address),
      order_items(quantity, unit_price, products(name))
    `, { count: 'exact' })
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .range(from, to)  // ✅ Pagination

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: ordersRaw, count: totalCount } = await query

  const totalPages = Math.ceil((totalCount ?? 0) / pageSize)

  return (
    <div className="space-y-6">
      <OrdersTable orders={ordersRaw ?? []} currency={business.currency} />
      
      {/* ✅ Pagination controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages} ({totalCount} total orders)
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Link 
              href={`?page=${page - 1}`}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link 
              href={`?page=${page + 1}`}
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Expected Impact**: Orders page load time: 10-15s → 2-3s

---

### STEP 2: Enable ISR on Dashboard

**File**: `app/(dashboard)/[businessSlug]/page.tsx`

```typescript
// ✅ Add at top of file
export const revalidate = 3600  // Revalidate every hour

// ✅ Add dynamic params
export async function generateStaticParams() {
  const supabase = await createClient()
  
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug')
    .limit(100)

  return (businesses ?? []).map((b) => ({
    businessSlug: b.slug,
  }))
}

export default async function BusinessOverviewPage({ params }: Props) {
  // ... existing code
}
```

**Expected Impact**: Dashboard load time: 8-10s → 0.5-1s (after first load)

---

### STEP 3: Memoize DashboardNav

**File**: `components/dashboard/DashboardNav.tsx`

```typescript
'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

const NAV_ITEMS = [
  { label: 'All Businesses', href: '/dashboard', icon: GridIcon },
  { label: 'New Business', href: '/dashboard/new-business', icon: PlusIcon },
]

// ✅ Split into smaller memoized components
const NavSidebar = memo(function NavSidebar({ 
  mobileOpen, 
  onMobileClose 
}: { 
  mobileOpen: boolean
  onMobileClose: () => void 
}) {
  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={onMobileClose} 
        />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col z-40',
        'transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#1f2937] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/images/dukannify logo.png" alt="Dukaanify" className="w-7 h-7" />
            <span className="font-bold text-[#f9fafb] text-sm">Dukaanify</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#d1d5db] hover:bg-[#1f2937] transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
})

const NavTopbar = memo(function NavTopbar({ 
  onMobileOpen 
}: { 
  onMobileOpen: () => void 
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 z-40 lg:pl-64">
      <button
        onClick={onMobileOpen}
        className="lg:hidden p-2 hover:bg-[#1f2937] rounded-lg"
      >
        <MenuIcon className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <UserMenu />
    </nav>
  )
})

const UserMenu = memo(function UserMenu() {
  const supabase = createClient()
  const { user } = useUser()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }, [supabase, router])

  const initials = (user?.user_metadata?.full_name as string | undefined)
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    ?? user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative">
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center hover:bg-indigo-700"
      >
        {initials}
      </button>
      {userMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1f2937] rounded-lg shadow-lg z-50">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-[#d1d5db] hover:bg-[#111827] rounded-lg"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
})

export const DashboardNav = memo(function DashboardNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <NavSidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={() => setMobileOpen(false)} 
      />
      <NavTopbar onMobileOpen={() => setMobileOpen(true)} />
    </>
  )
})

DashboardNav.displayName = 'DashboardNav'
```

**Expected Impact**: Navigation re-renders: 60% reduction

---

### STEP 4: Optimize Images

**File**: `components/dashboard/DashboardNav.tsx`

```typescript
// Change from:
<img src="/images/dukannify logo.png" alt="Dukaanify" className="w-7 h-7" />

// To:
import Image from 'next/image'

<Image 
  src="/images/dukannify logo.png" 
  alt="Dukaanify" 
  width={28} 
  height={28}
  className="w-7 h-7"
/>
```

**File**: `components/store/StorefrontShell.tsx`

```typescript
// Change from:
<div
  className="absolute inset-0 opacity-20"
  style={{
    backgroundImage: `url('${business.banner_image_url}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
/>

// To:
import Image from 'next/image'

<Image
  src={business.banner_image_url || '/placeholder-banner.jpg'}
  alt={business.name}
  fill
  className="absolute inset-0 opacity-20 object-cover"
  priority
/>
```

**Expected Impact**: Image load time -50%

---

### STEP 5: Add Caching Headers

**File**: `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  reactStrictMode: true,
  compress: true,  // ✅ Enable compression

  // ✅ Add caching headers
  async headers() {
    return [
      {
        source: '/store/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/(dashboard)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

**Expected Impact**: Repeat visits 50% faster

---

## Performance Monitoring Setup

### Install Web Vitals
```bash
npm install web-vitals
```

### Create monitoring hook
**File**: `lib/hooks/useWebVitals.ts`

```typescript
'use client'

import { useEffect } from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function useWebVitals() {
  useEffect(() => {
    getCLS(console.log)
    getFID(console.log)
    getFCP(console.log)
    getLCP(console.log)
    getTTFB(console.log)
  }, [])
}
```

### Use in root layout
**File**: `app/layout.tsx`

```typescript
'use client'

import { useWebVitals } from '@/lib/hooks/useWebVitals'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useWebVitals()
  
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

---

## Testing Checklist

- [ ] Test with Lighthouse (target: 85+)
- [ ] Test with WebPageTest
- [ ] Test on mobile devices
- [ ] Test with slow 3G network
- [ ] Test with slow CPU
- [ ] Monitor Core Web Vitals
- [ ] Check bundle size
- [ ] Check memory usage
- [ ] Check CPU usage
- [ ] Check network requests

---

## Deployment Checklist

- [ ] All fixes implemented
- [ ] All tests passing
- [ ] Lighthouse score 85+
- [ ] Mobile TTI < 5s
- [ ] Bundle size < 200KB
- [ ] No console errors
- [ ] No console warnings
- [ ] Performance monitoring set up
- [ ] Error tracking set up
- [ ] Ready for production

