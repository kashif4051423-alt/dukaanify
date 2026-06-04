# Image Upload Utility Guide

Complete reference for using the `uploadImage.ts` utility in your Dukaanify app.

---

## Overview

The `lib/uploadImage.ts` module provides four main functions:

1. **`uploadProductImage()`** - Upload image and get public URL
2. **`deleteProductImage()`** - Delete image by public URL
3. **`getSignedImageUrl()`** - Get temporary signed URL
4. **`listStoreImages()`** - List all images in a store folder

---

## Quick Start

### Basic Upload

```typescript
import { uploadProductImage } from '@/lib/uploadImage'

// In your component or server action
async function handleImageUpload(file: File, storeId: string) {
  try {
    const imageUrl = await uploadProductImage(file, storeId)
    console.log('Image uploaded:', imageUrl)
    // Save imageUrl to database
  } catch (error) {
    console.error('Upload failed:', error.message)
  }
}
```

### Using in a Form Component

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'

export function ImageUploadForm({ storeId }: { storeId: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const url = await uploadProductImage(file, storeId)
      setImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleUpload}
        disabled={uploading}
      />

      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {imageUrl && (
        <>
          <img src={imageUrl} alt="Uploaded" className="max-w-xs" />
          <p>URL: {imageUrl}</p>
        </>
      )}
    </div>
  )
}
```

---

## API Reference

### uploadProductImage

Uploads a file to Supabase storage and returns the public URL.

**Signature:**
```typescript
uploadProductImage(file: File, storeId: string): Promise<string>
```

**Parameters:**
- `file` (File) - File object from input element
- `storeId` (string) - Store/Business ID for folder organization

**Returns:**
- Promise<string> - Public URL of the uploaded image

**Throws:**
- Error if file type is invalid (not jpg, png, webp)
- Error if file size exceeds 2MB
- Error if upload fails

**Validation:**
- File type: jpg, png, webp only
- File size: max 2MB
- File must be provided
- storeId must be valid string

**Example:**
```typescript
import { uploadProductImage } from '@/lib/uploadImage'

try {
  const url = await uploadProductImage(file, 'business-123')
  // URL: https://[project].supabase.co/storage/v1/object/public/product-images/business-123/1704067200000-abc123.jpg
} catch (error) {
  console.error(error.message)
  // Example: "Invalid file type. Only jpg, png, webp are allowed."
  // Example: "File size exceeds 2MB limit. Current size: 3.50MB"
}
```

---

### deleteProductImage

Deletes an image from storage using its public URL.

**Signature:**
```typescript
deleteProductImage(publicUrl: string): Promise<void>
```

**Parameters:**
- `publicUrl` (string) - Public URL of the image to delete

**Returns:**
- Promise<void> - Resolves when deletion is complete

**Throws:**
- Error if URL is invalid
- Error if deletion fails

**Example:**
```typescript
import { deleteProductImage } from '@/lib/uploadImage'

try {
  await deleteProductImage('https://[project].supabase.co/storage/v1/object/public/product-images/business-123/image.jpg')
  console.log('Image deleted')
} catch (error) {
  console.error('Delete failed:', error.message)
}
```

---

### getSignedImageUrl

Creates a temporary signed URL for private image access.

**Signature:**
```typescript
getSignedImageUrl(publicUrl: string, expiresIn?: number): Promise<string>
```

**Parameters:**
- `publicUrl` (string) - Public URL of the image
- `expiresIn` (number, optional) - Expiration time in seconds (default: 3600 = 1 hour)

**Returns:**
- Promise<string> - Signed URL valid for specified duration

**Throws:**
- Error if URL is invalid
- Error if signed URL generation fails

**Example:**
```typescript
import { getSignedImageUrl } from '@/lib/uploadImage'

// Get URL valid for 2 hours
const signedUrl = await getSignedImageUrl(publicUrl, 7200)

// Use in email, share temporarily, etc.
```

---

### listStoreImages

Lists all images in a store's folder.

**Signature:**
```typescript
listStoreImages(storeId: string): Promise<any[]>
```

**Parameters:**
- `storeId` (string) - Store/Business ID

**Returns:**
- Promise<any[]> - Array of image objects in the folder

**Throws:**
- Error if listing fails

**Example:**
```typescript
import { listStoreImages } from '@/lib/uploadImage'

const images = await listStoreImages('business-123')
// Returns: [
//   { name: 'image1.jpg', id: '...', ... },
//   { name: 'image2.png', id: '...', ... }
// ]
```

---

## Configuration

The module exports a configuration object:

```typescript
import { uploadConfig } from '@/lib/uploadImage'

console.log(uploadConfig)
// {
//   allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
//   maxFileSize: 2097152,  // 2MB in bytes
//   maxFileSizeMB: 2,
//   bucketName: 'product-images'
// }
```

---

## Usage Examples

### Example 1: Upload in Server Action

```typescript
// app/actions/uploadProduct.ts
'use server'

import { uploadProductImage } from '@/lib/uploadImage'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProductWithImage(
  formData: FormData,
  storeId: string
) {
  const file = formData.get('image') as File

  // Upload image
  const imageUrl = await uploadProductImage(file, storeId)

  // Save product to database
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      image_url: imageUrl,
      name: formData.get('name'),
      price: formData.get('price')
    })

  if (error) throw error

  revalidatePath(`/store/${storeId}`)
  return data
}
```

### Example 2: Upload with Drag & Drop

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'

export function DragDropUpload({ storeId }: { storeId: string }) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await uploadFile(file)
    }
  }

  async function uploadFile(file: File) {
    setUploading(true)

    try {
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload
      const url = await uploadProductImage(file, storeId)
      console.log('Uploaded:', url)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-8 rounded-lg ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="max-h-64" />
      ) : (
        <p>Drag image here or click to select</p>
      )}

      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
        }}
        disabled={uploading}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input" className="cursor-pointer">
        {uploading && <p>Uploading...</p>}
      </label>
    </div>
  )
}
```

### Example 3: Product Card with Delete

```typescript
'use client'

import { useState } from 'react'
import { deleteProductImage } from '@/lib/uploadImage'

export function ProductCard({
  product
}: {
  product: { id: string; name: string; image_url: string }
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this image?')) return

    setDeleting(true)
    try {
      await deleteProductImage(product.image_url)
      // Remove product from UI or reload
      location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-2 font-bold">{product.name}</h3>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="mt-2 bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {deleting ? 'Deleting...' : 'Delete Image'}
      </button>
    </div>
  )
}
```

### Example 4: Image Upload with Progress

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'

export function ImageUploadWithProgress({ storeId }: { storeId: string }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(file: File) {
    setUploading(true)
    setProgress(0)

    try {
      // Simulate progress (since Supabase client doesn't easily expose progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const url = await uploadProductImage(file, storeId)

      clearInterval(progressInterval)
      setProgress(100)
      console.log('Success:', url)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
        disabled={uploading}
      />

      {uploading && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded h-4">
            <div
              className="bg-blue-500 h-4 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% uploaded</p>
        </div>
      )}
    </div>
  )
}
```

### Example 5: Multiple Image Upload

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'

export function MultiImageUpload({ storeId }: { storeId: string }) {
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  async function handleMultipleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = files.map((file) =>
        uploadProductImage(file, storeId)
      )

      const urls = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...urls])
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'One or more uploads failed'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleMultipleUpload}
        disabled={uploading}
      />

      {uploading && <p>Uploading {images.length} images...</p>}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((url) => (
          <img
            key={url}
            src={url}
            alt="Uploaded"
            className="w-full h-32 object-cover rounded"
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Error Handling

The module provides specific error messages:

```typescript
import { uploadProductImage } from '@/lib/uploadImage'

try {
  const url = await uploadProductImage(file, storeId)
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('file type')) {
      // Handle invalid file type
      console.error('Wrong file format:', error.message)
    } else if (error.message.includes('size')) {
      // Handle file too large
      console.error('File too large:', error.message)
    } else {
      // Handle other errors
      console.error('Upload error:', error.message)
    }
  }
}
```

**Common errors:**
- "Invalid file type. Only jpg, png, webp are allowed."
- "File size exceeds 2MB limit. Current size: X MB"
- "No file provided"
- "Invalid store ID"
- "Upload failed: [Supabase error]"

---

## File Path Structure

Images are stored at:
```
product-images/
└── {storeId}/
    └── {timestamp}-{random}.{ext}
```

**Example:**
```
product-images/
└── store-123/
    ├── 1704067200000-abc123.jpg
    ├── 1704067201000-def456.png
    └── 1704067202000-ghi789.webp
```

---

## Best Practices

### 1. Validate Before Upload
```typescript
// Check file exists and is valid type before upload
if (!file) return

const validTypes = ['image/jpeg', 'image/png', 'image/webp']
if (!validTypes.includes(file.type)) {
  alert('Invalid file type')
  return
}
```

### 2. Show User Feedback
```typescript
// Always provide feedback during upload
const [uploading, setUploading] = useState(false)
const [error, setError] = useState<string | null>(null)

setUploading(true)
try {
  // ... upload
} catch (err) {
  setError(err instanceof Error ? err.message : 'Error')
} finally {
  setUploading(false)
}
```

### 3. Save URL to Database
```typescript
// Always save the returned URL to database
const url = await uploadProductImage(file, storeId)
await saveProductToDatabase({
  imageUrl: url,
  // ... other fields
})
```

### 4. Handle Network Errors
```typescript
try {
  const url = await uploadProductImage(file, storeId)
} catch (error) {
  // User-friendly error message
  console.error('Upload failed:', error)
  // Retry logic or notify user
}
```

### 5. Cleanup on Delete
```typescript
// When deleting product, also delete image
await deleteProductImage(imageUrl)
await deleteProductFromDatabase(productId)
```

---

## Testing

### Test Upload Success
```typescript
// Create test file
const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

// Upload
const url = await uploadProductImage(testFile, 'test-store')
console.log('Success:', url)
```

### Test Validation
```typescript
// Test invalid file type
const invalidFile = new File(['test'], 'test.gif', { type: 'image/gif' })
try {
  await uploadProductImage(invalidFile, 'test-store')
} catch (error) {
  console.log('Caught expected error:', error.message)
}

// Test large file
const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg')
try {
  await uploadProductImage(largeFile, 'test-store')
} catch (error) {
  console.log('Caught expected error:', error.message)
}
```

---

## Troubleshooting

### "Bucket not found"
- Ensure bucket `product-images` exists in Supabase
- Check bucket is set to Public visibility

### "Permission denied"
- Check RLS policies are set up correctly
- Verify user is authenticated
- Check store ID matches user's business

### "Invalid image URL format"
- Verify URL comes from uploadProductImage()
- Check URL hasn't been modified
- Ensure it starts with https://

### "No signed URL returned"
- Verify image exists in storage
- Check file path is correct
- Try with longer expiration time

---

## Integration with Dukaanify

This utility is built to work with your existing setup:

✅ Uses `lib/supabase/client.ts`
✅ Works with `product-images` bucket
✅ Organizes by storeId (businessId)
✅ Returns public URLs for display
✅ Integrates with your products table

---

## Summary

The `uploadImage.ts` utility provides a complete solution for:
- Uploading images with validation
- Managing image storage
- Deleting images
- Generating temporary URLs
- Listing images

All errors are caught and handled, making it safe to use in production.
