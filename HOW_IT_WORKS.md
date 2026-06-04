# Dukaanify — How the Multi-Store System Works

## Folder Structure

```
dukaanify/
├── app/
│   ├── (auth)/                    # Login, Register, Forgot Password
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/               # Protected dashboard (requires login)
│   │   ├── layout.tsx             # Checks auth, shows sidebar
│   │   ├── dashboard/page.tsx     # Lists ALL stores of logged-in user
│   │   └── [businessSlug]/        # Dynamic route per store
│   │       ├── layout.tsx         # Verifies store belongs to user
│   │       ├── page.tsx           # Analytics overview
│   │       ├── products/page.tsx  # Product management
│   │       ├── orders/page.tsx    # Order management
│   │       ├── customers/page.tsx # Customer list
│   │       └── settings/page.tsx  # Store settings
│   │
│   └── store/
│       └── [slug]/page.tsx        # PUBLIC storefront (no login needed)
│
├── components/
│   ├── auth/                      # Login/Register forms
│   ├── dashboard/                 # Sidebar, business cards, forms
│   ├── products/                  # Product cards, forms, modals
│   ├── orders/                    # Order table, status updater
│   ├── store/                     # Public storefront components
│   └── analytics/                 # Charts
│
├── lib/
│   ├── actions/
│   │   ├── business.ts            # createBusiness, updateBusiness, deleteBusiness
│   │   ├── product.ts             # createProduct, updateProduct, deleteProduct
│   │   └── order.ts               # placeOrder, updateOrderStatus
│   ├── hooks/
│   │   └── useBusinesses.ts       # Client hook: fetch user's stores
│   ├── store/
│   │   └── cart.ts                # Zustand cart (localStorage, per-store)
│   └── supabase/
│       ├── client.ts              # Browser Supabase client
│       ├── server.ts              # Server Supabase client
│       └── middleware.ts          # Session refresh
│
├── types/
│   ├── models.ts                  # TypeScript interfaces
│   └── database.ts                # Supabase table types
│
└── supabase/
    └── FULL_SETUP.sql             # Run this ONCE to set up everything
```

---

## Database Schema

```sql
-- Each user can have many stores
businesses (
  id          uuid PRIMARY KEY,
  owner_id    uuid → auth.users(id),   -- who owns this store
  name        text,
  slug        text UNIQUE,             -- e.g. "ali-bakery"
  currency    text DEFAULT 'PKR',
  whatsapp_number  text,
  jazzcash_number  text,
  easypaisa_number text,
  sadapay_number   text
)

-- Products belong to a store
products (
  id           uuid PRIMARY KEY,
  business_id  uuid → businesses(id),  -- which store
  name         text,
  price        numeric,
  image_url    text,                   -- Supabase Storage public URL
  stock_quantity integer,
  is_active    boolean DEFAULT true
)

-- Orders belong to a store
orders (
  id             uuid PRIMARY KEY,
  business_id    uuid → businesses(id),
  customer_id    uuid → customers(id),
  status         text DEFAULT 'pending',
  total_amount   numeric,
  payment_method text DEFAULT 'cod'
)

-- Order items link orders to products
order_items (
  id          uuid PRIMARY KEY,
  order_id    uuid → orders(id),
  product_id  uuid → products(id),
  quantity    integer,
  unit_price  numeric,
  total_price numeric
)
```

---

## How Multi-Tenancy Works

### 1. User signs up → profile auto-created
```sql
-- Trigger in FULL_SETUP.sql runs automatically:
INSERT INTO profiles (id, email, full_name)
VALUES (new.id, new.email, ...)
```

### 2. User creates a store
```typescript
// lib/actions/business.ts
await supabase.from('businesses').insert({
  owner_id: user.id,   // ← links store to this user
  name,
  slug,
  currency,
})
```

### 3. Dashboard shows only THIS user's stores
```typescript
// app/(dashboard)/dashboard/page.tsx
const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('owner_id', user.id)   // ← only my stores
```

### 4. Store page loads by slug (public, no login)
```typescript
// app/store/[slug]/page.tsx
const { data: business } = await supabase
  .from('businesses')
  .select('*')
  .eq('slug', slug)          // ← find store by URL slug
  .eq('is_active', true)

const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('business_id', business.id)  // ← only this store's products
  .eq('is_active', true)
```

### 5. Dashboard verifies ownership before showing data
```typescript
// app/(dashboard)/[businessSlug]/layout.tsx
const { data: business } = await supabase
  .from('businesses')
  .select('*')
  .eq('slug', businessSlug)
  .eq('owner_id', user.id)   // ← must own this store
  .single()

if (!business) notFound()    // ← 404 if trying to access someone else's store
```

---

## Row Level Security (RLS)

RLS is enforced at the **database level** — even if someone bypasses the app, they can't read other users' data.

```sql
-- Businesses: only owner can read/write
CREATE POLICY "businesses: owner all" ON businesses
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id);

-- Products: only accessible if you own the parent business
CREATE POLICY "products: owner all" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = products.business_id
        AND b.owner_id = auth.uid()
    )
  );

-- Public can read active products (for storefront)
CREATE POLICY "products: public read" ON products
  FOR SELECT TO anon
  USING (is_active = true AND ...);
```

---

## Image Upload Flow

```typescript
// lib/actions/product.ts

// 1. Upload file to Supabase Storage
const { error } = await supabase.storage
  .from('product-images')          // bucket name
  .upload(`${businessId}/${Date.now()}.jpg`, file, { upsert: true })

// 2. Get the public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(path)

// 3. Save URL to products table
await supabase.from('products').insert({
  image_url: publicUrl,            // ← stored in DB
  ...
})
```

The public URL looks like:
```
https://[project].supabase.co/storage/v1/object/public/product-images/[businessId]/[timestamp].jpg
```

---

## Cart System (localStorage)

The cart is stored in the browser using Zustand + localStorage. Each store has its own isolated cart:

```typescript
// lib/store/cart.ts
const useCartStore = create(persist(
  (set, get) => ({
    items: {},  // { "ali-bakery": [...], "pizza-hut": [...] }

    addItem(slug, product) { ... },
    getItems(slug) { return get().items[slug] ?? [] },
    getTotal(slug) { ... },
    clearCart(slug) { ... },
  }),
  { name: 'dukaanify-cart' }  // localStorage key
))
```

---

## Checkout Flow

1. Customer adds products to cart on `/store/[slug]`
2. Clicks "Checkout" → `CheckoutModal` opens
3. Fills name, phone, address
4. Selects payment method (COD / JazzCash / Easypaisa / SadaPay)
5. Clicks "Place Order" → `placeOrder()` server action runs:
   - Creates/updates customer record
   - Creates order row with `business_id`
   - Creates order_items rows
   - Decrements stock
6. Success screen shows order number
7. Optional: "Confirm on WhatsApp" opens WhatsApp with pre-filled message

---

## Adding a New Store (Step by Step)

1. User logs in at `/login`
2. Goes to `/dashboard`
3. Clicks "New Business"
4. Fills form: name, slug, currency
5. `createBusiness()` action inserts into `businesses` table
6. Redirected to `/<slug>` (their new dashboard)
7. Store page immediately works at `/store/<slug>`
8. They can add products, receive orders — all isolated to their store

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server only
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Setup (One Time)

1. Create a Supabase project at supabase.com
2. Copy your URL and keys to `.env.local`
3. Go to **SQL Editor** in Supabase dashboard
4. Paste and run `supabase/FULL_SETUP.sql`
5. Run `npm install && npm run dev`
6. Open `http://localhost:3000`
