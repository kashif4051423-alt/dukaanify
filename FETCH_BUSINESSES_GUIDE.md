# Dukaanify - Active Businesses Fetcher Guide

یہ guide آپ کو Supabase سے active businesses fetch کرنے کے تمام طریقے سکھاتا ہے۔

## 📋 فہرست

1. [Quick Start](#quick-start)
2. [تینوں طریقے](#تینوں-طریقے)
3. [مثالیں](#مثالیں)
4. [API Reference](#api-reference)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

### سب سے تیز طریقہ: CLI Script

```bash
node scripts/fetch-active-businesses.mjs
```

یہ فوری طور پر تمام active businesses کو مختلف formats میں دکھائے گا۔

---

## تینوں طریقے

### 1️⃣ CLI Script (Node.js)

**فائل:** `scripts/fetch-active-businesses.mjs`

**استعمال:**
```bash
node scripts/fetch-active-businesses.mjs
```

**Output:**
- ✅ Formatted table
- ✅ JSON format
- ✅ CSV format
- ✅ Markdown table

**فوائل:**
- کوئی server نہیں چاہیے
- فوری نتائج
- Multiple formats میں export

---

### 2️⃣ TypeScript Functions

**فائل:** `lib/supabase/businesses.ts`

**استعمال:**
```typescript
import {
  fetchActiveBusinesses,
  fetchActiveBusinessesWithLinks,
  fetchBusinessBySlug,
  fetchBusinessesByOwner,
} from '@/lib/supabase/businesses';

// تمام businesses
const all = await fetchActiveBusinesses();

// Store links کے ساتھ
const withLinks = await fetchActiveBusinessesWithLinks();

// Specific business
const one = await fetchBusinessBySlug('my-store');

// Owner کی businesses
const ownerBiz = await fetchBusinessesByOwner('user-123');
```

**فوائل:**
- Next.js components میں براہ راست استعمال
- Type-safe
- Flexible اور reusable

---

### 3️⃣ API Endpoint

**Route:** `GET /api/businesses/active`

**استعمال:**
```bash
# JSON (default)
curl http://localhost:3000/api/businesses/active

# CSV
curl http://localhost:3000/api/businesses/active?format=csv

# Markdown
curl http://localhost:3000/api/businesses/active?format=markdown
```

**فوائل:**
- HTTP سے accessible
- Multiple formats
- Frontend سے آسانی سے call کر سکتے ہیں

---

## مثالیں

### مثال 1: Admin Dashboard میں تمام stores دکھائیں

**فائل:** `app/admin/businesses/page.tsx` (پہلے سے موجود)

```bash
# صرف یہ URL کھولیں
http://localhost:3000/admin/businesses
```

یہ page:
- ✅ تمام active businesses دکھاتا ہے
- ✅ Table, CSV, JSON views
- ✅ CSV/JSON download کی سہولت
- ✅ ہر store کا direct link

---

### مثال 2: Custom Component میں

```typescript
'use client';

import { fetchActiveBusinessesWithLinks } from '@/lib/supabase/businesses';
import { useEffect, useState } from 'react';

export function StoresList() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchActiveBusinessesWithLinks().then(setStores);
  }, []);

  return (
    <div>
      <h2>تمام Stores ({stores.length})</h2>
      <ul>
        {stores.map((store) => (
          <li key={store.id}>
            <a href={store.store_link}>{store.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### مثال 3: Server Component میں

```typescript
import { fetchActiveBusinessesWithLinks } from '@/lib/supabase/businesses';

export default async function StoresPage() {
  const stores = await fetchActiveBusinessesWithLinks();

  return (
    <div>
      <h1>Stores ({stores.length})</h1>
      {stores.map((store) => (
        <div key={store.id}>
          <h3>{store.name}</h3>
          <p>Slug: {store.slug}</p>
          <a href={store.store_link}>Visit Store</a>
        </div>
      ))}
    </div>
  );
}
```

---

### مثال 4: API سے CSV Download

```bash
curl http://localhost:3000/api/businesses/active?format=csv > businesses.csv
```

---

### مثال 5: Specific Owner کی Businesses

```typescript
import { fetchBusinessesByOwner } from '@/lib/supabase/businesses';

const ownerStores = await fetchBusinessesByOwner('user-id-123');
console.log(`Owner کے ${ownerStores.length} stores ہیں`);
```

---

## API Reference

### Functions

#### `fetchActiveBusinesses()`

تمام active businesses کو fetch کریں۔

```typescript
const businesses = await fetchActiveBusinesses();
```

**Returns:**
```typescript
Business[]
```

**Example:**
```typescript
const businesses = await fetchActiveBusinesses();
// [
//   { id: '1', name: 'Store 1', slug: 'store-1', owner_id: 'user-1' },
//   { id: '2', name: 'Store 2', slug: 'store-2', owner_id: 'user-2' }
// ]
```

---

#### `fetchActiveBusinessesWithLinks(baseUrl?)`

Store links کے ساتھ تمام active businesses۔

```typescript
const businesses = await fetchActiveBusinessesWithLinks('http://localhost:3000');
```

**Parameters:**
- `baseUrl` (optional): Base URL for store links (default: `NEXT_PUBLIC_APP_URL`)

**Returns:**
```typescript
BusinessWithLink[]
```

**Example:**
```typescript
const businesses = await fetchActiveBusinessesWithLinks();
// [
//   {
//     id: '1',
//     name: 'Store 1',
//     slug: 'store-1',
//     owner_id: 'user-1',
//     store_link: 'http://localhost:3000/store/store-1'
//   }
// ]
```

---

#### `fetchBusinessBySlug(slug)`

Slug سے specific business۔

```typescript
const business = await fetchBusinessBySlug('my-store');
```

**Parameters:**
- `slug` (required): Business slug

**Returns:**
```typescript
Business | null
```

**Example:**
```typescript
const business = await fetchBusinessBySlug('my-store');
if (business) {
  console.log(`Found: ${business.name}`);
} else {
  console.log('Business not found');
}
```

---

#### `fetchBusinessBySlugWithLink(slug, baseUrl?)`

Slug سے business (store link کے ساتھ)۔

```typescript
const business = await fetchBusinessBySlugWithLink('my-store');
```

**Parameters:**
- `slug` (required): Business slug
- `baseUrl` (optional): Base URL for store link

**Returns:**
```typescript
BusinessWithLink | null
```

---

#### `fetchBusinessesByOwner(ownerId, baseUrl?)`

Owner کی تمام active businesses۔

```typescript
const businesses = await fetchBusinessesByOwner('user-id-123');
```

**Parameters:**
- `ownerId` (required): Owner user ID
- `baseUrl` (optional): Base URL for store links

**Returns:**
```typescript
BusinessWithLink[]
```

---

### API Endpoint

#### `GET /api/businesses/active`

تمام active businesses کو مختلف formats میں۔

**Query Parameters:**
- `format` (optional): `json` | `csv` | `markdown` (default: `json`)
- `baseUrl` (optional): Custom base URL for store links

**Examples:**

```bash
# JSON
curl http://localhost:3000/api/businesses/active

# CSV
curl http://localhost:3000/api/businesses/active?format=csv

# Markdown
curl http://localhost:3000/api/businesses/active?format=markdown

# Custom base URL
curl "http://localhost:3000/api/businesses/active?baseUrl=https://example.com"
```

**Response (JSON):**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "total_count": 2,
  "businesses": [
    {
      "id": "1",
      "name": "Store 1",
      "slug": "store-1",
      "owner_id": "user-1",
      "store_link": "http://localhost:3000/store/store-1"
    }
  ]
}
```

---

## Data Types

```typescript
interface Business {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

interface BusinessWithLink extends Business {
  store_link: string;
}
```

---

## Troubleshooting

### ❌ "Supabase credentials not found"

**حل:**
1. `.env.local` فائل کھولیں
2. یقینی بنائیں کہ یہ variables موجود ہیں:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

### ❌ "No active businesses found"

**حل:**
1. Supabase dashboard میں جائیں
2. `businesses` table میں کوئی record ہے؟
3. کیا `is_active = true` ہے؟

### ❌ CORS Error

**حل:**
- API endpoint استعمال کریں: `/api/businesses/active`
- یا same-origin سے request کریں

### ❌ "Failed to fetch businesses"

**حل:**
1. Network connection چیک کریں
2. Supabase status چیک کریں
3. Credentials صحیح ہیں؟

---

## Performance Tips

### 1. Caching استعمال کریں

```typescript
import { unstable_cache } from 'next/cache';

const getCachedBusinesses = unstable_cache(
  async () => fetchActiveBusinessesWithLinks(),
  ['active-businesses'],
  { revalidate: 3600 } // 1 hour
);

const businesses = await getCachedBusinesses();
```

### 2. Pagination (بڑے datasets کے لیے)

```typescript
// Future enhancement
const { data, count } = await supabase
  .from('businesses')
  .select('*', { count: 'exact' })
  .eq('is_active', true)
  .range(0, 9); // First 10
```

### 3. Selective Fields

```typescript
// صرف ضروری fields fetch کریں
const { data } = await supabase
  .from('businesses')
  .select('id, name, slug') // صرف یہ
  .eq('is_active', true);
```

---

## Next Steps

1. ✅ CLI script سے test کریں
2. ✅ Admin page کھولیں: `/admin/businesses`
3. ✅ اپنے components میں functions استعمال کریں
4. ✅ API endpoint سے integrate کریں

---

## Support

کوئی سوال؟ یہ فائلیں دیکھیں:
- `scripts/fetch-active-businesses.mjs` - CLI implementation
- `lib/supabase/businesses.ts` - Functions
- `app/api/businesses/active/route.ts` - API endpoint
- `app/admin/businesses/page.tsx` - Example component
