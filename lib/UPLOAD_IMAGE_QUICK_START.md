# Quick Start - Image Upload

Copy-paste ready examples for the `uploadImage.ts` utility.

---

## Import

```typescript
import { uploadProductImage, deleteProductImage } from '@/lib/uploadImage'
```

---

## Basic Upload

```typescript
// In your component
const imageUrl = await uploadProductImage(file, 'store-123')
```

---

## Upload in Component (with error handling)

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'

export function UploadForm({ storeId }: { storeId: string }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const imageUrl = await uploadProductImage(file, storeId)
      setUrl(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input type="file" onChange={handle} disabled={loading} />
      {loading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {url && <img src={url} alt="Uploaded" className="max-w-xs" />}
    </div>
  )
}
```

---

## Upload in Server Action

```typescript
'use server'

import { uploadProductImage } from '@/lib/uploadImage'
import { revalidatePath } from 'next/cache'

export async function createProduct(
  formData: FormData,
  storeId: string
) {
  const file = formData.get('image') as File
  
  // Upload image
  const imageUrl = await uploadProductImage(file, storeId)
  
  // Save to database
  // ...
  
  revalidatePath('/products')
}
```

---

## Delete Image

```typescript
import { deleteProductImage } from '@/lib/uploadImage'

// Delete by URL
await deleteProductImage(imageUrl)
```

---

## List Images in Store

```typescript
import { listStoreImages } from '@/lib/uploadImage'

const images = await listStoreImages('store-123')
```

---

## Get Signed URL (Temporary Access)

```typescript
import { getSignedImageUrl } from '@/lib/uploadImage'

// URL valid for 2 hours
const signedUrl = await getSignedImageUrl(imageUrl, 7200)
```

---

## Configuration

```typescript
import { uploadConfig } from '@/lib/uploadImage'

// Allowed types: jpg, png, webp
// Max size: 2MB
// Bucket: product-images
console.log(uploadConfig)
```

---

## File Path Format

```
https://[project].supabase.co/storage/v1/object/public/product-images/{storeId}/{timestamp}-{random}.{ext}

Example:
https://abc123.supabase.co/storage/v1/object/public/product-images/store-123/1704067200000-abc123.jpg
```

---

## Error Messages

```
"Invalid file type. Only jpg, png, webp are allowed."
"File size exceeds 2MB limit. Current size: X MB"
"No file provided"
"Invalid store ID"
"Upload failed: [error]"
```

---

## Validation

Automatically validates:
- ✅ File type (jpg, png, webp only)
- ✅ File size (max 2MB)
- ✅ File provided
- ✅ Store ID valid

---

## Error Handling

```typescript
try {
  const url = await uploadProductImage(file, storeId)
} catch (error) {
  console.error(error.message)
}
```

---

Done! 🎉
