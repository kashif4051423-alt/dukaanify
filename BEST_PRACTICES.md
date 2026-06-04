# 🎯 NEXT.JS PERFORMANCE BEST PRACTICES

## 1. Server vs Client Components

### Rule 1: Default to Server Components
```typescript
// ✅ GOOD - Server component by default
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ❌ BAD - Unnecessary client component
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  return <div>{data}</div>
}
```

### Rule 2: Only Use Client Components for Interactivity
```typescript
// ✅ GOOD - Server component with client component for state
export default async function StorePage() {
  const products = await fetchProducts()
  return (
    <>
      <ProductGrid products={products} />  {/* Server component */}
      <CartProvider>  {/* Client component wrapper */}
        <CartSidebar />
      </CartProvider>
    </>
  )
}

// ❌ BAD - Entire page is client component
'use client'
export default function StorePage() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])
  return <ProductGrid products={products} />
}
```

### Rule 3: Move Client Components Down the Tree
```typescript
// ✅ GOOD - Client component is small and isolated
export function ProductCard({ product }: Props) {
  const [inCart, setInCart] = useState(false)
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => setInCart(!inCart)}>
        {inCart ? 'Remove' : 'Add to Cart'}
      </button>
    </div>
  )
}

// ❌ BAD - Client component wraps everything
'use client'
export function ProductGrid({ products }: Props) {
  const [inCart, setInCart] = useState({})
  return (
    <div>
      {products.map((p) => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <button onClick={() => setInCart({ ...inCart, [p.id]: !inCart[p.id] })}>
            {inCart[p.id] ? 'Remove' : 'Add to Cart'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## 2. Data Fetching Patterns

### Rule 1: Fetch Data on the Server
```typescript
// ✅ GOOD - Server-side data fetching
export default async function Page() {
  const data = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)

  return <ProductList products={data} />
}

// ❌ BAD - Client-side data fetching
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .then((res) => setData(res.data))
  }, [])
  return <ProductList products={data} />
}
```

### Rule 2: Use Parallel Queries
```typescript
// ✅ GOOD - Parallel queries
const [products, orders, customers] = await Promise.all([
  supabase.from('products').select('*'),
  supabase.from('orders').select('*'),
  supabase.from('customers').select('*'),
])

// ❌ BAD - Sequential queries
const products = await supabase.from('products').select('*')
const orders = await supabase.from('orders').select('*')
const customers = await supabase.from('customers').select('*')
```

### Rule 3: Use Nested Selects to Avoid N+1
```typescript
// ✅ GOOD - Single query with nested joins
const { data: orders } = await supabase
  .from('orders')
  .select(`
    id,
    status,
    customers(name, email),
    order_items(quantity, products(name, price))
  `)

// ❌ BAD - N+1 queries
const { data: orders } = await supabase.from('orders').select('*')
for (const order of orders) {
  const customer = await supabase
    .from('customers')
    .select('*')
    .eq('id', order.customer_id)
}
```

### Rule 4: Add Pagination
```typescript
// ✅ GOOD - Paginated query
const pageSize = 20
const page = 1
const from = (page - 1) * pageSize
const to = from + pageSize - 1

const { data, count } = await supabase
  .from('orders')
  .select('*', { count: 'exact' })
  .range(from, to)

// ❌ BAD - Load all data
const { data } = await supabase.from('orders').select('*')
```

---

## 3. Caching Strategies

### Rule 1: Use ISR for Static Content
```typescript
// ✅ GOOD - ISR with 1 hour revalidation
export const revalidate = 3600

export default async function StorePage() {
  const business = await fetchBusiness()
  return <StorefrontShell business={business} />
}

// ❌ BAD - No caching
export default async function StorePage() {
  const business = await fetchBusiness()
  return <StorefrontShell business={business} />
}
```

### Rule 2: Use Cache Headers
```typescript
// ✅ GOOD - Cache headers in next.config.ts
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
  ]
}

// ❌ BAD - No cache headers
async headers() {
  return []
}
```

### Rule 3: Use revalidatePath for Dynamic Updates
```typescript
// ✅ GOOD - Revalidate on update
'use server'

export async function updateProduct(id: string, data: any) {
  await supabase.from('products').update(data).eq('id', id)
  revalidatePath(`/dashboard/products`)
}

// ❌ BAD - No revalidation
export async function updateProduct(id: string, data: any) {
  await supabase.from('products').update(data).eq('id', id)
}
```

---

## 4. Image Optimization

### Rule 1: Always Use Next.js Image Component
```typescript
// ✅ GOOD - Next.js Image
import Image from 'next/image'

<Image
  src="/product.jpg"
  alt="Product"
  width={300}
  height={300}
  sizes="(max-width: 640px) 50vw, 33vw"
/>

// ❌ BAD - HTML img tag
<img src="/product.jpg" alt="Product" />
```

### Rule 2: Use Responsive Sizes
```typescript
// ✅ GOOD - Responsive sizes
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
/>

// ❌ BAD - No sizes
<Image
  src={product.image}
  alt={product.name}
  fill
/>
```

### Rule 3: Use Priority for Above-the-Fold Images
```typescript
// ✅ GOOD - Priority for hero image
<Image
  src={hero.image}
  alt="Hero"
  fill
  priority
/>

// ✅ GOOD - No priority for below-the-fold
<Image
  src={product.image}
  alt="Product"
  fill
  priority={false}
/>

// ❌ BAD - Priority for all images
<Image src={product.image} alt="Product" fill priority />
```

---

## 5. Component Optimization

### Rule 1: Use memo() for Expensive Components
```typescript
// ✅ GOOD - Memoized component
export const ProductCard = memo(function ProductCard({ product }: Props) {
  return <div>{product.name}</div>
})

// ❌ BAD - No memoization
export function ProductCard({ product }: Props) {
  return <div>{product.name}</div>
}
```

### Rule 2: Use useMemo for Expensive Calculations
```typescript
// ✅ GOOD - Memoized calculation
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0)
}, [items])

// ❌ BAD - Recalculates on every render
const total = items.reduce((sum, item) => sum + item.price, 0)
```

### Rule 3: Use useCallback for Event Handlers
```typescript
// ✅ GOOD - Memoized callback
const handleClick = useCallback(() => {
  addToCart(product)
}, [product])

// ❌ BAD - New function on every render
const handleClick = () => {
  addToCart(product)
}
```

### Rule 4: Use Zustand Selectors
```typescript
// ✅ GOOD - Selector only subscribes to needed state
const cartCount = useCartStore((state) => 
  state.items.reduce((sum, item) => sum + item.quantity, 0)
)

// ❌ BAD - Subscribes to entire store
const { items } = useCartStore()
const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
```

---

## 6. Bundle Size Optimization

### Rule 1: Code Split Large Components
```typescript
// ✅ GOOD - Dynamic import for heavy component
import dynamic from 'next/dynamic'

const CheckoutModal = dynamic(() => import('./CheckoutModal'), {
  loading: () => <div>Loading...</div>,
})

// ❌ BAD - Import everything upfront
import { CheckoutModal } from './CheckoutModal'
```

### Rule 2: Remove Unused Dependencies
```bash
# ✅ GOOD - Check for unused packages
npm ls

# ✅ GOOD - Remove unused packages
npm prune

# ❌ BAD - Keep unused packages
npm install some-unused-package
```

### Rule 3: Use Tree Shaking
```typescript
// ✅ GOOD - Named imports (tree-shakeable)
import { formatCurrency } from '@/lib/utils/format'

// ❌ BAD - Default import (not tree-shakeable)
import utils from '@/lib/utils'
const { formatCurrency } = utils
```

---

## 7. Mobile Optimization

### Rule 1: Mobile-First Design
```typescript
// ✅ GOOD - Mobile-first responsive design
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
  {products.map((p) => <ProductCard key={p.id} product={p} />)}
</div>

// ❌ BAD - Desktop-first
<div className="grid grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
  {products.map((p) => <ProductCard key={p.id} product={p} />)}
</div>
```

### Rule 2: Optimize for Touch
```typescript
// ✅ GOOD - Large touch targets
<button className="px-4 py-3 min-h-12">Add to Cart</button>

// ❌ BAD - Small touch targets
<button className="px-2 py-1">Add to Cart</button>
```

### Rule 3: Avoid Layout Shift
```typescript
// ✅ GOOD - Fixed dimensions prevent layout shift
<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={300}
/>

// ❌ BAD - No dimensions cause layout shift
<Image
  src={product.image}
  alt={product.name}
/>
```

---

## 8. Error Handling

### Rule 1: Use Error Boundaries
```typescript
// ✅ GOOD - Error boundary wraps component
<ErrorBoundary>
  <StorefrontShell business={business} products={products} />
</ErrorBoundary>

// ❌ BAD - No error boundary
<StorefrontShell business={business} products={products} />
```

### Rule 2: Add Loading States
```typescript
// ✅ GOOD - Loading state
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// With Suspense:
<Suspense fallback={<Skeleton />}>
  <DataComponent />
</Suspense>

// ❌ BAD - No loading state
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  return <div>{data}</div>
}
```

### Rule 3: Add Error States
```typescript
// ✅ GOOD - Error state
export default async function Page() {
  try {
    const data = await fetchData()
    return <div>{data}</div>
  } catch (error) {
    return <div>Error loading data</div>
  }
}

// ❌ BAD - No error handling
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

---

## 9. Monitoring & Analytics

### Rule 1: Track Core Web Vitals
```typescript
// ✅ GOOD - Track Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)

// ❌ BAD - No monitoring
// No tracking
```

### Rule 2: Use Performance API
```typescript
// ✅ GOOD - Measure performance
const start = performance.now()
const data = await fetchData()
const end = performance.now()
console.log(`Fetch took ${end - start}ms`)

// ❌ BAD - No measurement
const data = await fetchData()
```

### Rule 3: Set Up Error Tracking
```typescript
// ✅ GOOD - Track errors with Sentry
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
})

// ❌ BAD - No error tracking
// No error tracking
```

---

## 10. Production Deployment

### Rule 1: Enable Compression
```typescript
// ✅ GOOD - Enable compression
const nextConfig: NextConfig = {
  compress: true,
}

// ❌ BAD - No compression
const nextConfig: NextConfig = {}
```

### Rule 2: Use CDN
```typescript
// ✅ GOOD - Use CDN for images
const nextConfig: NextConfig = {
  images: {
    domains: ['cdn.example.com'],
  },
}

// ❌ BAD - Serve images from origin
const nextConfig: NextConfig = {}
```

### Rule 3: Enable Security Headers
```typescript
// ✅ GOOD - Security headers
async headers() {
  return [
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
}

// ❌ BAD - No security headers
async headers() {
  return []
}
```

---

## Performance Checklist

- [ ] All pages are server components by default
- [ ] Client components are small and isolated
- [ ] Data fetching is server-side
- [ ] Queries are parallel and optimized
- [ ] Pagination is implemented
- [ ] ISR is enabled for static content
- [ ] Cache headers are set
- [ ] Images use Next.js Image component
- [ ] Images have responsive sizes
- [ ] Components are memoized
- [ ] Expensive calculations use useMemo
- [ ] Event handlers use useCallback
- [ ] Zustand uses selectors
- [ ] Large components are code-split
- [ ] Unused dependencies are removed
- [ ] Tree shaking is enabled
- [ ] Mobile-first design is used
- [ ] Touch targets are large
- [ ] Layout shift is prevented
- [ ] Error boundaries are used
- [ ] Loading states are shown
- [ ] Error states are shown
- [ ] Web Vitals are tracked
- [ ] Errors are tracked
- [ ] Compression is enabled
- [ ] CDN is used
- [ ] Security headers are set
- [ ] Lighthouse score is 85+
- [ ] Mobile TTI is < 5s
- [ ] Bundle size is < 200KB

