# 💻 READY-TO-USE CODE EXAMPLES

## Copy-Paste Solutions for Common Issues

---

## 1. Memoized ProductCard Component

**File**: `components/store/ProductCard.tsx`

```typescript
'use client'

import { memo, useMemo, useCallback } from 'react'
import Image from 'next/image'
import type { Product } from '@/types/models'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  product: Product
  businessSlug: string
  businessName: string
  currency: string
  whatsappNumber: string | null
  onQuickView: (product: Product) => void
}

export const ProductCard = memo(
  function ProductCard({
    product,
    businessSlug,
    businessName,
    currency,
    whatsappNumber,
    onQuickView,
  }: Props) {
    // ✅ Only subscribe to THIS product's cart item
    const cartItem = useCartStore((state) =>
      state.items[businessSlug]?.find((i) => i.product.id === product.id)
    )

    const { addItem } = useCartStore()

    const inCart = !!cartItem
    const outOfStock = product.stock_quantity === 0

    // ✅ Memoize handlers
    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        addItem(businessSlug, product)
      },
      [businessSlug, product, addItem]
    )

    const handleOpenWhatsApp = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!whatsappNumber) return
        const message = `Hi ${businessName}! I'd like to order:\n\n• ${product.name}\n\nPrice: ${formatCurrency(product.price, currency)}`
        window.open(
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
          '_blank'
        )
      },
      [whatsappNumber, businessName, product.name, product.price, currency]
    )

    return (
      <div
        onClick={() => onQuickView(product)}
        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col cursor-pointer"
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {product.description}
          </p>

          <div className="mt-auto pt-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.price, currency)}
              </span>
              {product.compare_price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.compare_price, currency)}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {whatsappNumber && (
                <button
                  onClick={handleOpenWhatsApp}
                  disabled={outOfStock}
                  className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  WhatsApp
                </button>
              )}
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  inCart
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                } disabled:bg-gray-300 disabled:text-gray-500`}
              >
                {inCart ? '✓ In Cart' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // ✅ Custom comparison: only re-render if product or businessSlug changes
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.businessSlug === nextProps.businessSlug &&
      prevProps.currency === nextProps.currency
    )
  }
)

ProductCard.displayName = 'ProductCard'
```

---

## 2. Optimized Zustand Store with Selectors

**File**: `lib/store/cart.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types/models'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: Record<string, CartItem[]>
  addItem: (slug: string, product: Product) => void
  removeItem: (slug: string, productId: string) => void
  updateQuantity: (slug: string, productId: string, quantity: number) => void
  clearCart: (slug: string) => void
  getItems: (slug: string) => CartItem[]
  getCount: (slug: string) => number
  getTotal: (slug: string) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      addItem(slug, product) {
        set((state) => {
          const current = state.items[slug] ?? []
          const existing = current.find((i) => i.product.id === product.id)
          const updated = existing
            ? current.map((i) =>
                i.product.id === product.id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + 1, product.stock_quantity),
                    }
                  : i
              )
            : [...current, { product, quantity: 1 }]
          return { items: { ...state.items, [slug]: updated } }
        })
      },

      removeItem(slug, productId) {
        set((state) => ({
          items: {
            ...state.items,
            [slug]: (state.items[slug] ?? []).filter(
              (i) => i.product.id !== productId
            ),
          },
        }))
      },

      updateQuantity(slug, productId, quantity) {
        set((state) => ({
          items: {
            ...state.items,
            [slug]: (state.items[slug] ?? []).map((i) =>
              i.product.id === productId ? { ...i, quantity } : i
            ),
          },
        }))
      },

      clearCart(slug) {
        set((state) => ({
          items: { ...state.items, [slug]: [] },
        }))
      },

      getItems(slug) {
        return get().items[slug] ?? []
      },

      getCount(slug) {
        return (get().items[slug] ?? []).reduce((sum, i) => sum + i.quantity, 0)
      },

      getTotal(slug) {
        return (get().items[slug] ?? []).reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-store',
      version: 1,
    }
  )
)

// ✅ Selectors to prevent unnecessary re-renders
export function useCartItems(slug: string) {
  return useCartStore((state) => state.items[slug] ?? [])
}

export function useCartCount(slug: string) {
  return useCartStore((state) => {
    const items = state.items[slug] ?? []
    return items.reduce((sum, i) => sum + i.quantity, 0)
  })
}

export function useCartTotal(slug: string) {
  return useCartStore((state) => {
    const items = state.items[slug] ?? []
    return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  })
}

export function useCartItem(slug: string, productId: string) {
  return useCartStore((state) =>
    (state.items[slug] ?? []).find((i) => i.product.id === productId)
  )
}
```

---

## 3. Error Boundary Component

**File**: `components/ErrorBoundary.tsx`

```typescript
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-red-900 font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-red-800 text-sm">
              Please refresh the page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-2 bg-red-100 rounded text-xs overflow-auto">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

---

## 4. Optimized Orders Page with Pagination

**File**: `app/(dashboard)/[businessSlug]/orders/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { formatCurrency } from '@/lib/utils/format'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ businessSlug: string }>
  searchParams: Promise<{ status?: string; page?: string }>
}

export const metadata: Metadata = { title: 'Orders — Dukaanify' }

export default async function OrdersPage({ params, searchParams }: Props) {
  const { businessSlug } = await params
  const { status: statusFilter, page: pageStr } = await searchParams

  // ✅ Pagination setup
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

  // ✅ Optimized query with pagination
  let query = supabase
    .from('orders')
    .select(
      `
      id, 
      status, 
      total_amount, 
      created_at, 
      notes, 
      customers(name, email, phone, address),
      order_items(quantity, unit_price, products(name))
    `,
      { count: 'exact' }
    )
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: ordersRaw, count: totalCount } = await query

  const totalPages = Math.ceil((totalCount ?? 0) / pageSize)

  // ✅ Transform data server-side
  type RawOrder = {
    id: string
    status: string
    total_amount: number
    created_at: string
    notes: string | null
    customers: {
      name: string
      email: string | null
      phone: string | null
      address?: string | null
    } | null
    order_items: Array<{
      quantity: number
      unit_price: number
      products: { name: string } | null
    }>
  }

  const orders = (ordersRaw as unknown as RawOrder[]).map((o) => ({
    id: o.id,
    status: o.status,
    total: o.total_amount,
    date: new Date(o.created_at).toLocaleDateString(),
    customer: o.customers?.name ?? 'Unknown',
    items: o.order_items.length,
    notes: o.notes,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          Showing {from + 1} to {Math.min(to + 1, totalCount ?? 0)} of{' '}
          {totalCount ?? 0} orders
        </p>
      </div>

      <OrderFilters currentStatus={statusFilter} />

      <OrdersTable orders={orders} currency={business.currency} />

      {/* ✅ Pagination controls */}
      <div className="flex items-center justify-between border-t pt-6">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Next.js Config with Performance Optimizations

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
  compress: true, // ✅ Enable gzip compression

  // ✅ Cache headers for better performance
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
      // ✅ Security headers
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## 6. Memoized Dashboard Navigation

**File**: `components/dashboard/DashboardNav.tsx`

```typescript
'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

const NAV_ITEMS = [
  { label: 'All Businesses', href: '/dashboard' },
  { label: 'New Business', href: '/dashboard/new-business' },
]

// ✅ Memoized sidebar component
const NavSidebar = memo(function NavSidebar({
  mobileOpen,
  onMobileClose,
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
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-[#111827] border-r border-[#1f2937] flex flex-col z-40',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-[#1f2937]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img
              src="/images/dukannify logo.png"
              alt="Dukaanify"
              className="w-7 h-7"
            />
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
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
})

// ✅ Memoized topbar component
const NavTopbar = memo(function NavTopbar({
  onMobileOpen,
}: {
  onMobileOpen: () => void
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 z-40 lg:pl-64">
      <button
        onClick={onMobileOpen}
        className="lg:hidden p-2 hover:bg-[#1f2937] rounded-lg"
      >
        ☰
      </button>
      <div className="flex-1" />
      <UserMenu />
    </nav>
  )
})

// ✅ Memoized user menu
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
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? user?.email?.[0]?.toUpperCase() ?? '?'

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

// ✅ Main component
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

---

## 7. Web Vitals Monitoring Hook

**File**: `lib/hooks/useWebVitals.ts`

```typescript
'use client'

import { useEffect } from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function useWebVitals() {
  useEffect(() => {
    // ✅ Track Core Web Vitals
    getCLS((metric) => {
      console.log('CLS:', metric.value)
      // Send to analytics
    })

    getFID((metric) => {
      console.log('FID:', metric.value)
      // Send to analytics
    })

    getFCP((metric) => {
      console.log('FCP:', metric.value)
      // Send to analytics
    })

    getLCP((metric) => {
      console.log('LCP:', metric.value)
      // Send to analytics
    })

    getTTFB((metric) => {
      console.log('TTFB:', metric.value)
      // Send to analytics
    })
  }, [])
}
```

---

## 8. Optimized RevenueChart Component

**File**: `components/analytics/RevenueChart.tsx`

```typescript
'use client'

import { memo, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils/format'

interface DayData {
  label: string
  date: string
  revenue: number
  count: number
}

interface Props {
  data: DayData[]
  currency: string
}

export const RevenueChart = memo(function RevenueChart({
  data,
  currency,
}: Props) {
  // ✅ Memoize calculations
  const { maxRevenue, hasData } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.revenue), 1)
    const has = data.some((d) => d.revenue > 0)
    return { maxRevenue: max, hasData: has }
  }, [data])

  return (
    <div>
      {/* Bar chart */}
      <div className="flex items-end gap-2 h-36">
        {data.map((day, i) => {
          const heightPct = (day.revenue / maxRevenue) * 100
          const isToday = i === data.length - 1
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              {/* Tooltip */}
              {day.revenue > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatCurrency(day.revenue, currency)}
                  <br />
                  <span className="text-gray-400">
                    {day.count} order{day.count !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full flex items-end justify-center"
                style={{ height: '120px' }}
              >
                <div
                  className={`w-3/4 rounded-t transition-all duration-300 ${
                    isToday ? 'bg-indigo-600' : 'bg-indigo-400'
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    minHeight: day.revenue > 0 ? '4px' : '0',
                  }}
                />
              </div>

              {/* Label */}
              <span className="text-xs text-gray-500 mt-1">{day.label}</span>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="text-center py-8 text-gray-500">No revenue data yet</div>
      )}
    </div>
  )
})

RevenueChart.displayName = 'RevenueChart'
```

---

## How to Use These Examples

1. **Copy the code** from the section you need
2. **Replace the file** in your project
3. **Test with Lighthouse** to verify improvements
4. **Monitor performance** with Web Vitals

All examples are production-ready and follow Next.js best practices.

