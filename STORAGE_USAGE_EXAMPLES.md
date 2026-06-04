# Storage Usage Examples - Dukaanify

Complete examples for using the image upload functionality in your app.

---

## Setup: Get Supabase Client

### In Components (Client-Side)

```typescript
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()
  // Now use supabase for storage operations
}
```

### In API Routes (Server-Side)

```typescript
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  // Now use supabase for storage operations
}
```

---

## Example 1: Upload Product Image

### Basic Upload in Component

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage'

export function ProductImageUpload({
  businessId,
  productId,
  onUploadComplete
}: {
  businessId: string
  productId: string
  onUploadComplete: (url: string) => void
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const { url, error: uploadError } = await uploadProductImage(
      supabase,
      file,
      businessId,
      productId
    )

    setUploading(false)

    if (uploadError) {
      setError(uploadError)
    } else if (url) {
      onUploadComplete(url)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  )
}
```

### Upload with Drag & Drop

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage'

export function DragDropImageUpload({
  businessId,
  productId,
  onUploadComplete
}: {
  businessId: string
  productId: string
  onUploadComplete: (url: string) => void
}) {
  const supabase = createClient()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function handleFiles(files: FileList) {
    const file = files[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    const { url, error } = await uploadProductImage(
      supabase,
      file,
      businessId,
      productId
    )
    setUploading(false)

    if (error) {
      alert(`Upload failed: ${error}`)
      setPreviewUrl(null)
    } else if (url) {
      onUploadComplete(url)
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={`border-2 border-dashed p-8 rounded-lg transition ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${uploading ? 'opacity-50' : ''}`}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="max-h-64" />
      ) : (
        <p className="text-center text-gray-500">
          Drag and drop image here or click to select
        </p>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.currentTarget.files!)}
        className="hidden"
        id="file-input"
        disabled={uploading}
      />
      <label htmlFor="file-input" className="cursor-pointer">
        {uploading && <p>Uploading...</p>}
      </label>
    </div>
  )
}
```

---

## Example 2: Display Product Images

### Simple Image Display

```typescript
export function ProductImage({
  imageUrl,
  productName
}: {
  imageUrl: string
  productName: string
}) {
  return (
    <img
      src={imageUrl}
      alt={productName}
      className="w-full h-64 object-cover rounded"
      onError={(e) => {
        // Fallback image if upload fails
        e.currentTarget.src = '/fallback-product.jpg'
      }}
    />
  )
}
```

### Gallery with Multiple Images

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { listBusinessImages } from '@/lib/supabase/storage'
import { useEffect } from 'react'

export function ProductGallery({ businessId }: { businessId: string }) {
  const supabase = createClient()
  const [images, setImages] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    loadImages()
  }, [businessId])

  async function loadImages() {
    const { files, error } = await listBusinessImages(supabase, businessId)
    if (error) {
      console.error('Failed to load images:', error)
    } else {
      setImages(files || [])
    }
  }

  if (images.length === 0) {
    return <p>No images available</p>
  }

  const selectedFile = images[selectedIndex]
  const imageUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]}/storage/v1/object/public/product-images/${businessId}/${selectedFile.name}`

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative w-full aspect-square bg-gray-100 rounded">
        <img
          src={imageUrl}
          alt="Product"
          className="w-full h-full object-cover rounded"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto">
        {images.map((file, index) => (
          <button
            key={file.id}
            onClick={() => setSelectedIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded ${
              index === selectedIndex ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <img
              src={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]}/storage/v1/object/public/product-images/${businessId}/${file.name}`}
              alt={`Thumbnail ${index}`}
              className="w-full h-full object-cover rounded"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## Example 3: Delete Product Image

### Delete Single Image

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { deleteProductImage } from '@/lib/supabase/storage'
import { useState } from 'react'

export function DeleteImageButton({
  imageUrl,
  onDeleteComplete
}: {
  imageUrl: string
  onDeleteComplete: () => void
}) {
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this image?')) return

    setDeleting(true)
    const { success, error } = await deleteProductImage(supabase, imageUrl)
    setDeleting(false)

    if (error) {
      alert(`Delete failed: ${error}`)
    } else {
      onDeleteComplete()
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

### Batch Delete Images

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { deleteProductImage } from '@/lib/supabase/storage'
import { useState } from 'react'

export function BatchDeleteImages({
  imageUrls,
  onDeleteComplete
}: {
  imageUrls: string[]
  onDeleteComplete: () => void
}) {
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [progress, setProgress] = useState(0)

  async function handleBatchDelete() {
    if (!confirm(`Delete ${imageUrls.length} images?`)) return

    setDeleting(true)
    setProgress(0)

    let deleted = 0
    let failed = 0

    for (const url of imageUrls) {
      const { success } = await deleteProductImage(supabase, url)
      if (success) deleted++
      else failed++

      setProgress(deleted + failed)
    }

    setDeleting(false)

    alert(`Deleted: ${deleted}, Failed: ${failed}`)
    if (deleted > 0) {
      onDeleteComplete()
    }
  }

  return (
    <div>
      <button
        onClick={handleBatchDelete}
        disabled={deleting}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? `Deleting ${progress}/${imageUrls.length}...` : 'Delete All'}
      </button>
    </div>
  )
}
```

---

## Example 4: Product Create/Update Form

### Complete Product Form with Image Upload

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/lib/supabase/storage'

export function ProductForm({ businessId }: { businessId: string }) {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: ''
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImageUpload(file: File) {
    setUploading(true)
    setError(null)

    const { url, error: uploadError } = await uploadProductImage(
      supabase,
      file,
      businessId
    )

    setUploading(false)

    if (uploadError) {
      setError(uploadError)
    } else if (url) {
      setFormData({ ...formData, imageUrl: url })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Save product with imageUrl to your database
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          businessId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      alert('Product created successfully!')
      setFormData({ name: '', description: '', price: '', imageUrl: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Product Image</label>
        {formData.imageUrl && (
          <div className="mb-2">
            <img
              src={formData.imageUrl}
              alt="Product preview"
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0]
            if (file) handleImageUpload(file)
          }}
          disabled={uploading}
          className="w-full"
        />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  )
}
```

---

## Example 5: API Route for Server-Side Upload

### API Endpoint: POST /api/products/upload

```typescript
// app/api/products/upload/route.ts

import { createClient } from '@/lib/supabase/server'
import { uploadProductImage } from '@/lib/supabase/storage'

export async function POST(request: Request) {
  try {
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessId = formData.get('businessId') as string
    const productId = formData.get('productId') as string | undefined

    if (!file || !businessId) {
      return Response.json(
        { error: 'Missing file or businessId' },
        { status: 400 }
      )
    }

    // Get server supabase client
    const supabase = await createClient()

    // Upload image
    const { url, error } = await uploadProductImage(
      supabase,
      file,
      businessId,
      productId
    )

    if (error) {
      return Response.json({ error }, { status: 400 })
    }

    return Response.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
```

### Usage in Component

```typescript
async function uploadImageViaAPI(file: File, businessId: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('businessId', businessId)

  const response = await fetch('/api/products/upload', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  
  if (data.error) {
    console.error('Upload failed:', data.error)
  } else {
    console.log('Image URL:', data.url)
  }
}
```

---

## Tips & Best Practices

### 1. Always Validate File Type Client-Side
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

if (!ALLOWED_TYPES.includes(file.type)) {
  setError('Invalid file type')
  return
}
```

### 2. Show Upload Progress
```typescript
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(path, file, {
    onUploadProgress(progress) {
      console.log(`Uploaded: ${progress.loaded}/${progress.total}`)
      setProgress((progress.loaded / progress.total) * 100)
    }
  })
```

### 3. Handle Errors Gracefully
```typescript
const { url, error } = await uploadProductImage(supabase, file, businessId)

if (error) {
  if (error.includes('Permission denied')) {
    setError('You do not have permission to upload images for this business')
  } else if (error.includes('must be under 5MB')) {
    setError('Image file is too large (max 5MB)')
  } else {
    setError(error)
  }
}
```

### 4. Implement Retry Logic
```typescript
async function uploadWithRetry(
  supabase: SupabaseClient,
  file: File,
  businessId: string,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    const { url, error } = await uploadProductImage(
      supabase,
      file,
      businessId
    )

    if (!error) return { url, error: null }
    if (i < maxRetries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)))
  }

  return { url: null, error: 'Max retries reached' }
}
```

### 5. Cache Public URLs
```typescript
// Store image URLs in your database
// Don't regenerate them on every page load

// When creating product:
const { url } = await uploadProductImage(supabase, file, businessId)
await saveProductToDatabase({
  name,
  imageUrl: url  // Store this
})

// When displaying product:
const product = await getProductFromDatabase(productId)
<img src={product.imageUrl} />  // Use stored URL
```
