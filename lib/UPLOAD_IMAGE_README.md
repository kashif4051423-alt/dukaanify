# Image Upload Utility - Complete Reference

Reusable image upload utility for Dukaanify Next.js app.

---

## What You Got

### File: `lib/uploadImage.ts`

A production-ready utility with 4 functions:

1. **`uploadProductImage(file, storeId)`** - Upload and get URL
2. **`deleteProductImage(publicUrl)`** - Delete by URL
3. **`getSignedImageUrl(publicUrl, expiresIn)`** - Temporary URL
4. **`listStoreImages(storeId)`** - List images

### Features

✅ File type validation (jpg, png, webp only)
✅ File size limit (max 2MB)
✅ Random filename generation (prevents conflicts)
✅ Public URL generation
✅ Error handling with try/catch
✅ Organized by storeId (multi-tenant)
✅ TypeScript with full types
✅ Works with existing Supabase client

---

## Quick Start

### 1. Import

```typescript
import { uploadProductImage } from '@/lib/uploadImage'
```

### 2. Upload

```typescript
const url = await uploadProductImage(file, 'store-123')
```

### 3. Display

```typescript
<img src={url} alt="Product" />
```

### 4. Delete

```typescript
import { deleteProductImage } from '@/lib/uploadImage'
await deleteProductImage(url)
```

---

## Documentation Files

| File | Content |
|------|---------|
| `uploadImage.ts` | The utility (use this in your code) |
| `UPLOAD_IMAGE_README.md` | This file - overview |
| `UPLOAD_IMAGE_QUICK_START.md` | Copy-paste examples |
| `UPLOAD_IMAGE_GUIDE.md` | Complete API reference |
| `UPLOAD_IMAGE_EXAMPLES.md` | Real-world integration examples |

---

## File Specifications

### Location
```
lib/uploadImage.ts
```

### Storage Bucket
```
product-images (Public)
```

### File Path Format
```
{storeId}/{timestamp}-{random}.{ext}

Example:
store-123/1704067200000-abc123.jpg
```

### Public URL Format
```
https://[project].supabase.co/storage/v1/object/public/product-images/{storeId}/{filename}
```

### Validation
- ✅ File types: jpg, png, webp
- ✅ Max size: 2MB
- ✅ File required
- ✅ storeId required

---

## API Reference

### uploadProductImage

```typescript
async function uploadProductImage(
  file: File,
  storeId: string
): Promise<string>
```

**Returns:** Public URL of uploaded image
**Throws:** Error with validation or upload details

**Example:**
```typescript
try {
  const url = await uploadProductImage(file, 'store-123')
  console.log('Uploaded:', url)
} catch (error) {
  console.error(error.message)
}
```

---

### deleteProductImage

```typescript
async function deleteProductImage(publicUrl: string): Promise<void>
```

**Returns:** void (nothing)
**Throws:** Error if deletion fails

**Example:**
```typescript
await deleteProductImage('https://...product-images/store-123/image.jpg')
```

---

### getSignedImageUrl

```typescript
async function getSignedImageUrl(
  publicUrl: string,
  expiresIn?: number
): Promise<string>
```

**Returns:** Signed URL valid for specified duration
**Throws:** Error if generation fails

**Example:**
```typescript
// Valid for 2 hours
const signedUrl = await getSignedImageUrl(url, 7200)
```

---

### listStoreImages

```typescript
async function listStoreImages(storeId: string): Promise<any[]>
```

**Returns:** Array of image objects
**Throws:** Error if listing fails

**Example:**
```typescript
const images = await listStoreImages('store-123')
```

---

## Integration Examples

### Client Component (Simple)

```typescript
'use client'

import { uploadProductImage } from '@/lib/uploadImage'

export function Upload({ storeId }: { storeId: string }) {
  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = await uploadProductImage(file, storeId)
      console.log('URL:', url)
    }
  }

  return <input type="file" onChange={handle} />
}
```

### Server Action

```typescript
'use server'

import { uploadProductImage } from '@/lib/uploadImage'

export async function createProduct(
  formData: FormData,
  storeId: string
) {
  const file = formData.get('image') as File
  const url = await uploadProductImage(file, storeId)
  // Save to database...
}
```

### With Error Handling

```typescript
try {
  const url = await uploadProductImage(file, storeId)
  // Use url
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('file type')) {
      console.error('Wrong format')
    } else if (error.message.includes('size')) {
      console.error('Too large')
    }
  }
}
```

---

## Error Handling

### Automatic Validation Errors

```
"Invalid file type. Only jpg, png, webp are allowed."
"File size exceeds 2MB limit. Current size: X MB"
"No file provided"
"Invalid store ID"
```

### Upload Errors

```
"Upload failed: [Supabase error]"
"Failed to generate public URL"
```

### Delete Errors

```
"Invalid image URL format"
"Delete failed: [Supabase error]"
```

---

## Common Patterns

### Pattern 1: Upload & Save to DB

```typescript
// 1. Upload image
const url = await uploadProductImage(file, storeId)

// 2. Save to database
const { data } = await supabase.from('products').insert({
  image_url: url,
  // ... other fields
})
```

### Pattern 2: Delete & Cleanup

```typescript
// 1. Delete from storage
await deleteProductImage(product.image_url)

// 2. Delete from database
await supabase.from('products').delete().eq('id', productId)
```

### Pattern 3: Update Image

```typescript
// 1. Upload new image
const newUrl = await uploadProductImage(file, storeId)

// 2. Delete old image
if (product.image_url) {
  await deleteProductImage(product.image_url)
}

// 3. Update database
await supabase
  .from('products')
  .update({ image_url: newUrl })
  .eq('id', productId)
```

### Pattern 4: Multiple Uploads

```typescript
const urls = await Promise.all(
  files.map(file => uploadProductImage(file, storeId))
)
```

---

## Best Practices

1. **Always validate before upload**
   ```typescript
   if (!file) return
   if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
   ```

2. **Show user feedback**
   ```typescript
   const [loading, setLoading] = useState(false)
   setLoading(true)
   // ... upload
   setLoading(false)
   ```

3. **Save URL to database**
   - Always save the returned URL
   - Never re-generate URLs on each page load

4. **Handle errors gracefully**
   ```typescript
   try {
     const url = await uploadProductImage(file, storeId)
   } catch (error) {
     // Show user-friendly error message
   }
   ```

5. **Cleanup on delete**
   - Delete from storage AND database
   - Don't just delete from database

---

## Testing

### Test Upload

```typescript
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
const url = await uploadProductImage(file, 'test-store')
console.assert(url.includes('product-images'), 'URL should contain bucket name')
```

### Test Validation

```typescript
// Test invalid type
const invalidFile = new File(['x'], 'test.gif', { type: 'image/gif' })
try {
  await uploadProductImage(invalidFile, 'store')
  console.error('Should have thrown')
} catch (error) {
  console.assert(error.message.includes('file type'), 'Should mention file type')
}

// Test large file
const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'test.jpg')
try {
  await uploadProductImage(largeFile, 'store')
  console.error('Should have thrown')
} catch (error) {
  console.assert(error.message.includes('size'), 'Should mention size')
}
```

---

## Integration with Dukaanify

This utility is built to work with your stack:

✅ Uses existing Supabase client setup
✅ Works with `product-images` bucket
✅ Organizes by storeId (for multi-tenancy)
✅ Returns public URLs for display
✅ Compatible with your products table

---

## File Configuration

### uploadImage.ts Constants

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024  // 2MB
const BUCKET_NAME = 'product-images'
```

To change these, edit the constants at the top of `uploadImage.ts`.

---

## Troubleshooting

### "Bucket not found"
- Create `product-images` bucket in Supabase
- Set to Public visibility

### "Permission denied"
- Check RLS policies are set up
- User must be authenticated
- Check store ID

### "Invalid image URL format"
- Verify URL comes from uploadProductImage()
- Check URL hasn't been modified

### "File not found" (on delete)
- Verify image exists
- Check file path is correct

---

## Next Steps

1. **Review the code** → `lib/uploadImage.ts`
2. **Read quick start** → `UPLOAD_IMAGE_QUICK_START.md`
3. **Check examples** → `UPLOAD_IMAGE_EXAMPLES.md`
4. **Use in your app** → Pick an example and adapt
5. **Test it** → Try upload/delete/view

---

## Summary

You now have:

✅ Production-ready upload utility
✅ File validation (type & size)
✅ Error handling
✅ Public URL generation
✅ Delete functionality
✅ TypeScript types
✅ Multi-tenant support (by storeId)
✅ Complete documentation

Just import and use in your components!

---

## Example Usage (Copy-Paste Ready)

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'

export function ImageUpload({ storeId }: { storeId: string }) {
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {url && <img src={url} alt="Uploaded" style={{ maxWidth: '300px' }} />}
    </div>
  )
}
```

Copy, paste, and you're done! 🚀
