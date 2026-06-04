# Active Businesses Fetcher

یہ script Supabase سے تمام active businesses کو fetch کرتا ہے اور ان کے store links نکالتا ہے۔

## استعمال

### 1. Node.js Script (CLI)

```bash
node scripts/fetch-active-businesses.mjs
```

**Output میں شامل ہے:**
- Formatted table
- JSON format
- CSV format
- Markdown table

### 2. TypeScript Functions

اپنے Next.js components یا API routes میں استعمال کریں:

```typescript
import {
  fetchActiveBusinesses,
  fetchActiveBusinessesWithLinks,
  fetchBusinessBySlug,
  fetchBusinessesByOwner,
} from '@/lib/supabase/businesses';

// تمام active businesses fetch کریں
const businesses = await fetchActiveBusinesses();

// Store links کے ساتھ fetch کریں
const businessesWithLinks = await fetchActiveBusinessesWithLinks();

// Specific business fetch کریں
const business = await fetchBusinessBySlug('my-store');

// Owner کی تمام businesses fetch کریں
const ownerBusinesses = await fetchBusinessesByOwner('user-id-123');
```

### 3. API Endpoint

```bash
# JSON format (default)
curl http://localhost:3000/api/businesses/active

# CSV format
curl http://localhost:3000/api/businesses/active?format=csv

# Markdown format
curl http://localhost:3000/api/businesses/active?format=markdown

# Custom base URL
curl "http://localhost:3000/api/businesses/active?baseUrl=https://example.com"
```

## Functions

### `fetchActiveBusinesses()`
تمام active businesses کو fetch کریں۔

```typescript
const businesses = await fetchActiveBusinesses();
// Returns: Business[]
```

### `fetchActiveBusinessesWithLinks(baseUrl?)`
تمام active businesses کو store links کے ساتھ fetch کریں۔

```typescript
const businesses = await fetchActiveBusinessesWithLinks('http://localhost:3000');
// Returns: BusinessWithLink[]
```

### `fetchBusinessBySlug(slug)`
Slug سے specific business fetch کریں۔

```typescript
const business = await fetchBusinessBySlug('my-store');
// Returns: Business | null
```

### `fetchBusinessBySlugWithLink(slug, baseUrl?)`
Slug سے specific business fetch کریں (store link کے ساتھ)۔

```typescript
const business = await fetchBusinessBySlugWithLink('my-store');
// Returns: BusinessWithLink | null
```

### `fetchBusinessesByOwner(ownerId, baseUrl?)`
Owner کی تمام active businesses fetch کریں۔

```typescript
const businesses = await fetchBusinessesByOwner('user-id-123');
// Returns: BusinessWithLink[]
```

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

## مثالیں

### مثال 1: Dashboard میں تمام stores دکھائیں

```typescript
'use client';

import { useEffect, useState } from 'react';
import { fetchActiveBusinessesWithLinks } from '@/lib/supabase/businesses';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchActiveBusinessesWithLinks();
        setStores(data);
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  if (loading) return <div>لوڈ ہو رہا ہے...</div>;

  return (
    <div>
      <h1>تمام Stores ({stores.length})</h1>
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

### مثال 2: API سے CSV download کریں

```bash
curl http://localhost:3000/api/businesses/active?format=csv > businesses.csv
```

### مثال 3: Markdown report بنائیں

```bash
curl http://localhost:3000/api/businesses/active?format=markdown > businesses.md
```

## Requirements

- Node.js 18+
- Supabase credentials in `.env.local`
- `@supabase/supabase-js` package

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### "Supabase credentials not found"
یقینی بنائیں کہ `.env.local` میں یہ variables موجود ہیں:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### "No active businesses found"
Database میں کوئی business `is_active = true` کے ساتھ نہیں ہے۔

### CORS errors
API endpoint استعمال کریں جو same-origin سے ہو۔
