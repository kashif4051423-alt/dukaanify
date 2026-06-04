# Real-World Integration Examples

Complete examples for integrating image uploads into your Dukaanify app.

---

## Example 1: Product Creation Form

Complete form for creating a product with image upload.

**File: `app/products/create/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'
import { createProduct } from '@/app/actions/products'

export default function CreateProductPage({ params }: { params: { storeId: string } }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null as File | null
  })

  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setFormData({ ...formData, image: file })

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function uploadImage() {
    if (!formData.image) return

    setLoading(true)
    setError(null)

    try {
      const url = await uploadProductImage(formData.image, params.storeId)
      setImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!imageUrl) {
      setError('Please upload an image first')
      return
    }

    try {
      await createProduct({
        storeId: params.storeId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl
      })

      // Success - redirect or reset form
      alert('Product created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Enter product name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded px-3 py-2 h-32"
            placeholder="Enter product description"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="0.00"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Image</label>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs h-32 object-cover rounded"
              />
            </div>
          )}

          {/* Upload Status */}
          {imageUrl && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">✓ Image uploaded successfully</p>
            </div>
          )}

          {/* File Input & Upload Button */}
          <div className="flex gap-2">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageSelect}
              disabled={loading}
              className="flex-1"
            />
            <button
              type="button"
              onClick={uploadImage}
              disabled={!formData.image || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Upload info */}
          <p className="text-sm text-gray-500 mt-2">
            JPG, PNG, or WebP • Max 2MB
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!imageUrl}
            className="flex-1 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Create Product
          </button>
          <button
            type="button"
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## Example 2: Drag & Drop Image Upload

Advanced upload with drag & drop support.

**File: `components/ImageUploadDragDrop.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'
import { uploadConfig } from '@/lib/uploadImage'

interface ImageUploadDragDropProps {
  storeId: string
  onUploadComplete: (url: string) => void
  onError?: (error: string) => void
}

export function ImageUploadDragDrop({
  storeId,
  onUploadComplete,
  onError
}: ImageUploadDragDropProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  async function handleFile(file: File) {
    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90))
      }, 100)

      const url = await uploadProductImage(file, storeId)

      clearInterval(progressInterval)
      setProgress(100)

      onUploadComplete(url)

      // Reset
      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
        setPreview(null)
      }, 500)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Upload failed'
      onError?.(message)
      setIsUploading(false)
      setProgress(0)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center
        transition-all cursor-pointer
        ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }
        ${isUploading ? 'opacity-60' : ''}
      `}
    >
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        disabled={isUploading}
        className="hidden"
        id="file-input"
      />

      {preview ? (
        <div>
          <img
            src={preview}
            alt="Preview"
            className="mx-auto max-h-48 mb-4"
          />
          {isUploading && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{progress}% uploaded</p>
            </>
          )}
        </div>
      ) : (
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-lg font-medium text-gray-900">
            Drag & drop image here
          </p>
          <p className="mt-1 text-sm text-gray-500">or click to select</p>
          <p className="mt-2 text-xs text-gray-400">
            {uploadConfig.allowedTypes.map((t) => t.split('/')[1]).join(', ')} • Max{' '}
            {uploadConfig.maxFileSizeMB}MB
          </p>
        </div>
      )}

      <label
        htmlFor="file-input"
        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Select Image'}
      </label>
    </div>
  )
}
```

---

## Example 3: Product Card with Image Delete

Product display card with delete functionality.

**File: `components/ProductCard.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { deleteProductImage } from '@/lib/uploadImage'
import { deleteProduct } from '@/app/actions/products'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
  }
  onDelete?: () => void
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"?`)) return

    setIsDeleting(true)
    setError(null)

    try {
      // Delete image from storage
      await deleteProductImage(product.imageUrl)

      // Delete product from database
      await deleteProduct(product.id)

      onDelete?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Delete failed'
      setError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition"
          onError={(e) => {
            e.currentTarget.src = '/fallback-product.jpg'
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-4">
          ${product.price.toFixed(2)}
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 font-medium"
        >
          {isDeleting ? 'Deleting...' : 'Delete Product'}
        </button>
      </div>
    </div>
  )
}
```

---

## Example 4: Multiple Image Upload

Upload multiple images at once.

**File: `components/MultiImageUpload.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'

interface MultiImageUploadProps {
  storeId: string
  onComplete: (urls: string[]) => void
}

export function MultiImageUpload({ storeId, onComplete }: MultiImageUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
  }

  async function handleUpload() {
    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const key = file.name + Date.now()
        setProgress((prev) => ({ ...prev, [key]: 0 }))

        // Simulate progress
        const interval = setInterval(() => {
          setProgress((prev) => ({
            ...prev,
            [key]: Math.min((prev[key] || 0) + 20, 90)
          }))
        }, 100)

        try {
          const url = await uploadProductImage(file, storeId)
          setProgress((prev) => ({ ...prev, [key]: 100 }))
          clearInterval(interval)
          return url
        } catch (error) {
          clearInterval(interval)
          throw error
        }
      })

      const urls = await Promise.all(uploadPromises)
      onComplete(urls)
      setFiles([])
      setProgress({})
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleSelect}
          disabled={uploading}
          className="w-full"
        />
      </div>

      {files.length > 0 && (
        <>
          <p className="text-sm text-gray-600">
            {files.length} file(s) selected
          </p>

          {Object.entries(progress).map(([key, percent]) => (
            <div key={key}>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload All'}
          </button>
        </>
      )}
    </div>
  )
}
```

---

## Example 5: Server Action Integration

Upload in a server action for better security.

**File: `app/actions/products.ts`**

```typescript
'use server'

import { uploadProductImage, deleteProductImage } from '@/lib/uploadImage'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateProductInput {
  storeId: string
  name: string
  description: string
  price: number
  imageUrl: string
}

export async function createProduct(input: CreateProductInput) {
  try {
    const supabase = await createClient()

    // Save product to database
    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id: input.storeId,
        name: input.name,
        description: input.description,
        price: input.price,
        image_url: input.imageUrl
      })
      .select()

    if (error) throw error

    revalidatePath(`/store/${input.storeId}`)
    return { success: true, data }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create product'
    return { success: false, error: message }
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient()

    // Get product to find image URL
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_url, store_id')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    // Delete image from storage
    if (product?.image_url) {
      await deleteProductImage(product.image_url)
    }

    // Delete product from database
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) throw deleteError

    revalidatePath(`/store/${product?.store_id}`)
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete product'
    return { success: false, error: message }
  }
}
```

---

## Example 6: Hook for Upload Logic

Reusable hook for handling uploads.

**File: `hooks/useImageUpload.ts`**

```typescript
import { useState } from 'react'
import { uploadProductImage, deleteProductImage } from '@/lib/uploadImage'

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function useImageUpload(options?: UseImageUploadOptions) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, storeId: string) => {
    setLoading(true)
    setError(null)

    try {
      const imageUrl = await uploadProductImage(file, storeId)
      setUrl(imageUrl)
      options?.onSuccess?.(imageUrl)
      return imageUrl
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const delete_ = async () => {
    if (!url) return

    setLoading(true)
    setError(null)

    try {
      await deleteProductImage(url)
      setUrl(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setUrl(null)
    setError(null)
    setLoading(false)
  }

  return {
    url,
    loading,
    error,
    upload,
    delete: delete_,
    reset
  }
}
```

**Usage:**

```typescript
export function MyComponent({ storeId }: { storeId: string }) {
  const { url, loading, error, upload } = useImageUpload({
    onSuccess: (url) => console.log('Uploaded:', url)
  })

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      await upload(file, storeId)
    }
  }

  return (
    <div>
      <input onChange={handle} disabled={loading} />
      {loading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {url && <img src={url} alt="Uploaded" />}
    </div>
  )
}
```

---

## Summary

These examples show how to integrate the upload utility into:
- ✅ Product creation forms
- ✅ Drag & drop uploads
- ✅ Product cards with delete
- ✅ Multiple image uploads
- ✅ Server actions
- ✅ Custom hooks

Pick the example that best fits your use case!
