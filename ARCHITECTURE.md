# 🏗️ Active Businesses Fetcher - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dukaanify App                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  CLI Script  │ │  Functions   │ │  API Route   │
        │   (Node.js)  │ │ (TypeScript) │ │  (Next.js)   │
        └──────────────┘ └──────────────┘ └──────────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Supabase Client  │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Supabase DB      │
                    │  (businesses)     │
                    └───────────────────┘
```

---

## 1. CLI Script Path

```
User Terminal
    │
    ▼
node scripts/fetch-active-businesses.mjs
    │
    ├─ Load .env.local
    │
    ├─ Initialize Supabase Client
    │
    ├─ Query: SELECT * FROM businesses WHERE is_active = true
    │
    ├─ Generate Store Links
    │
    └─ Output Multiple Formats
        ├─ Console Table
        ├─ JSON
        ├─ CSV
        └─ Markdown
```

### Data Flow
```
.env.local
    │
    ├─ NEXT_PUBLIC_SUPABASE_URL
    ├─ SUPABASE_SERVICE_ROLE_KEY
    └─ NEXT_PUBLIC_APP_URL
         │
         ▼
    Supabase Client
         │
         ▼
    Query Database
         │
         ▼
    Process Results
         │
         ├─ Add store_link: http://localhost:3000/store/[slug]
         │
         └─ Format Output
            ├─ Table
            ├─ JSON
            ├─ CSV
            └─ Markdown
```

---

## 2. TypeScript Functions Path

```
Your Component/Page
    │
    ▼
import { fetchActiveBusinessesWithLinks } from '@/lib/supabase/businesses'
    │
    ▼
lib/supabase/businesses.ts
    │
    ├─ fetchActiveBusinesses()
    │   └─ Returns: Business[]
    │
    ├─ fetchActiveBusinessesWithLinks()
    │   └─ Returns: BusinessWithLink[]
    │
    ├─ fetchBusinessBySlug()
    │   └─ Returns: Business | null
    │
    ├─ fetchBusinessBySlugWithLink()
    │   └─ Returns: BusinessWithLink | null
    │
    └─ fetchBusinessesByOwner()
        └─ Returns: BusinessWithLink[]
             │
             ▼
        Supabase Client
             │
             ▼
        Query Database
             │
             ▼
        Return Results
```

### Usage Examples

```
Server Component
    │
    ├─ async function
    │
    └─ await fetchActiveBusinessesWithLinks()
        │
        └─ Render directly

Client Component
    │
    ├─ useEffect hook
    │
    └─ fetchActiveBusinessesWithLinks()
        │
        └─ setState
        │
        └─ Render
```

---

## 3. API Endpoint Path

```
HTTP Request
    │
    ▼
GET /api/businesses/active?format=csv
    │
    ▼
app/api/businesses/active/route.ts
    │
    ├─ Parse query params
    │   ├─ format: 'json' | 'csv' | 'markdown'
    │   └─ baseUrl: custom URL
    │
    ├─ Call fetchActiveBusinessesWithLinks()
    │
    ├─ Format Response
    │   ├─ JSON → NextResponse.json()
    │   ├─ CSV → text/csv
    │   └─ Markdown → text/markdown
    │
    └─ Return Response
        │
        ▼
    HTTP Response
        │
        ├─ 200 OK (success)
        └─ 500 Error (failure)
```

### Request/Response Examples

```
Request:
GET /api/businesses/active?format=csv

Response:
Content-Type: text/csv
Content-Disposition: attachment; filename="businesses.csv"

ID,Name,Slug,Owner ID,Store Link
"1","Store 1","store-1","user-1","http://localhost:3000/store/store-1"
```

---

## 4. Admin Dashboard Path

```
Browser
    │
    ▼
http://localhost:3000/admin/businesses
    │
    ▼
app/admin/businesses/page.tsx
    │
    ├─ Client Component
    │
    ├─ useEffect
    │   │
    │   └─ fetchActiveBusinessesWithLinks()
    │
    ├─ State Management
    │   ├─ businesses: Business[]
    │   ├─ loading: boolean
    │   └─ error: string | null
    │
    ├─ UI Controls
    │   ├─ Format Selector (Table/CSV/JSON)
    │   ├─ Download Buttons
    │   └─ Search/Filter (future)
    │
    └─ Render
        ├─ Table View
        ├─ CSV View
        └─ JSON View
```

---

## Data Models

### Business (from Supabase)
```typescript
{
  id: string;           // UUID
  name: string;         // "My Store"
  slug: string;         // "my-store"
  owner_id: string;     // UUID
  is_active: boolean;   // true/false
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

### BusinessWithLink (enriched)
```typescript
{
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  store_link: string;   // "http://localhost:3000/store/my-store"
}
```

---

## Database Query

### SQL Query
```sql
SELECT 
  id,
  name,
  slug,
  owner_id
FROM businesses
WHERE is_active = true
ORDER BY created_at DESC;
```

### Supabase Query
```typescript
const { data, error } = await supabase
  .from('businesses')
  .select('id, name, slug, owner_id')
  .eq('is_active', true);
```

---

## Error Handling Flow

```
Try to Fetch
    │
    ├─ Success
    │   └─ Return Data
    │
    └─ Error
        │
        ├─ Network Error
        │   └─ "Failed to connect to Supabase"
        │
        ├─ Auth Error
        │   └─ "Invalid credentials"
        │
        ├─ Query Error
        │   └─ "Table not found"
        │
        └─ Not Found
            └─ "No active businesses"
```

---

## Performance Considerations

### 1. Query Optimization
```
Current: SELECT id, name, slug, owner_id
         WHERE is_active = true

Indexes needed:
- businesses(is_active)
- businesses(slug)
- businesses(owner_id)
```

### 2. Caching Strategy
```
CLI Script
├─ No caching (always fresh)

Functions
├─ Optional: unstable_cache() for 1 hour

API Endpoint
├─ Optional: Cache-Control headers

Admin Page
├─ Optional: SWR or React Query
```

### 3. Pagination (Future)
```
Current: Fetch all active businesses

Future:
- Limit: 50 per page
- Offset: page * limit
- Total count: for pagination UI
```

---

## Security Considerations

### 1. Authentication
```
✅ Using SUPABASE_SERVICE_ROLE_KEY
   - Server-side only
   - Full database access
   - Not exposed to client

✅ Using NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Client-side
   - Limited access
   - Row-level security
```

### 2. Data Exposure
```
✅ Only fetching:
   - id, name, slug, owner_id
   - No sensitive data

✅ Store links are public
   - /store/[slug] is public route
```

### 3. Rate Limiting (Future)
```
API Endpoint
├─ Add rate limiting middleware
├─ Limit: 100 requests per minute
└─ Return 429 Too Many Requests
```

---

## File Structure

```
dukaanify/
│
├── scripts/
│   ├── fetch-active-businesses.mjs    ← CLI Script
│   └── README.md
│
├── lib/supabase/
│   └── businesses.ts                   ← Functions
│
├── app/
│   ├── api/
│   │   └── businesses/
│   │       └── active/
│   │           └── route.ts            ← API Endpoint
│   │
│   └── admin/
│       └── businesses/
│           └── page.tsx                ← Admin Dashboard
│
├── .env.local                          ← Credentials
│
├── FETCH_BUSINESSES_GUIDE.md           ← Documentation
├── BUSINESSES_SETUP_SUMMARY.md         ← Summary
└── ARCHITECTURE.md                     ← This file
```

---

## Integration Points

### 1. With Other Components
```
Dashboard
    └─ fetchActiveBusinessesWithLinks()
        └─ Display stores

Store Directory
    └─ fetchActiveBusinessesWithLinks()
        └─ List all stores

Email Service
    └─ fetchActiveBusinesses()
        └─ Get owner emails

Analytics
    └─ fetchBusinessesByOwner()
        └─ Track performance
```

### 2. With External Services
```
CSV Export
    └─ /api/businesses/active?format=csv
        └─ Download to Excel

Webhook
    └─ /api/businesses/active
        └─ Send to third-party

Automation
    └─ CLI script
        └─ Scheduled job
```

---

## Deployment Checklist

- [ ] `.env.local` has all required variables
- [ ] Supabase credentials are correct
- [ ] `businesses` table exists in database
- [ ] `is_active` column exists
- [ ] Row-level security is configured
- [ ] API endpoint is accessible
- [ ] Admin page is protected (if needed)
- [ ] Error handling is in place
- [ ] Logging is configured
- [ ] Performance is acceptable

---

## Future Enhancements

```
Phase 1 (Current)
├─ Fetch active businesses
├─ Generate store links
└─ Multiple output formats

Phase 2 (Planned)
├─ Pagination
├─ Filtering (by owner, date, etc.)
├─ Sorting
└─ Search

Phase 3 (Future)
├─ Caching
├─ Rate limiting
├─ Webhooks
└─ Real-time updates
```

---

## Monitoring & Logging

```
CLI Script
├─ Console output
└─ Error messages

Functions
├─ Error throwing
└─ Try-catch handling

API Endpoint
├─ Request logging
├─ Response logging
└─ Error tracking

Admin Page
├─ Loading states
├─ Error messages
└─ Success feedback
```

---

## Summary

```
┌─────────────────────────────────────────┐
│   Active Businesses Fetcher System      │
├─────────────────────────────────────────┤
│ 3 Ways to Access:                       │
│ 1. CLI Script (Node.js)                 │
│ 2. TypeScript Functions                 │
│ 3. API Endpoint (HTTP)                  │
├─────────────────────────────────────────┤
│ 1 Admin Dashboard                       │
│ 1 Database (Supabase)                   │
│ Multiple Output Formats                 │
│ Full Documentation                      │
└─────────────────────────────────────────┘
```
