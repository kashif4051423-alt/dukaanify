# ImageUploader - Quick Examples

Copy-paste ready examples for the `ImageUploader` component.

---

## Basic Usage

```typescript
import { ImageUploader } from '@/components/ImageUploader'

export function MyForm() {
  const [imageUrl, setImageUrl] = useState('')

  return (
    <ImageUploader
      storeId="store-123"
      onUpload={setImageUrl}
    />
  )
}
```

---

## In Product Form

```typescript
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'

export function CreateProductPage({ params }: { params: { storeId: string } }) {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    imageUrl: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product.imageUrl) {
      alert('Please upload an image')
      return
    }

    // Save product...
    console.log('Saving:', product)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Image</label>
        <ImageUploader
          storeId={params.storeId}
          onUpload={(url) => setProduct({ ...product, imageUrl: url })}
          onError={(error) => alert(`Error: ${error}`)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price</label>
        <input
          type="number"
          step="0.01"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={!product.imageUrl}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        Create Product
      </button>
    </form>
  )
}
```

---

## With Error Handling

```typescript
import { ImageUploader } from '@/components/ImageUploader'
import { useState } from 'react'

export function UploadWithErrorHandling({ storeId }: { storeId: string }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  function handleError(errorMsg: string) {
    setError(errorMsg)
    // Log to error tracking service
    console.error('Upload error:', errorMsg)
  }

  return (
    <div>
      <ImageUploader
        storeId={storeId}
        onUpload={(imageUrl) => {
          setUrl(imageUrl)
          setError('')
        }}
        onError={handleError}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
```

---

## Multiple Images

```typescript
import { ImageUploader } from '@/components/ImageUploader'
import { useState } from 'react'

export function MultiImageGallery({ storeId }: { storeId: string }) {
  const [images, setImages] = useState<string[]>([])

  return (
    <div className="space-y-6">
      <ImageUploader
        storeId={storeId}
        onUpload={(url) => setImages([...images, url])}
      />

      {images.length > 0 && (
        <div>
          <h3 className="font-bold mb-4">
            Images ({images.length})
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {images.map((url) => (
              <img
                key={url}
                src={url}
                alt="Product"
                className="w-full h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## With Loading State

```typescript
import { ImageUploader } from '@/components/ImageUploader'
import { useState } from 'react'

export function UploadWithLoading({ storeId }: { storeId: string }) {
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!imageUrl) return

    setSaving(true)
    try {
      await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ imageUrl })
      })
      alert('Saved!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <ImageUploader
        storeId={storeId}
        onUpload={setImageUrl}
      />

      {imageUrl && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      )}
    </div>
  )
}
```

---

## Custom Size Limit

```typescript
import { ImageUploader } from '@/components/ImageUploader'

export function LargeImageUpload({ storeId }: { storeId: string }) {
  return (
    <ImageUploader
      storeId={storeId}
      onUpload={(url) => console.log('Uploaded:', url)}
      maxSize={10}  // 10MB instead of 2MB
    />
  )
}
```

---

## Edit Product Image

```typescript
import { ImageUploader } from '@/components/ImageUploader'
import { deleteProductImage } from '@/lib/uploadImage'
import { useState } from 'react'

export function EditProductImage({
  storeId,
  currentImage
}: {
  storeId: string
  currentImage: string
}) {
  const [newImage, setNewImage] = useState('')

  async function handleSave() {
    try {
      // Delete old image
      await deleteProductImage(currentImage)

      // Save new image reference
      await fetch('/api/products', {
        method: 'PUT',
        body: JSON.stringify({ imageUrl: newImage })
      })

      alert('Image updated!')
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">Current Image</p>
        <img
          src={currentImage}
          alt="Current"
          className="w-full max-w-xs h-auto rounded"
        />
      </div>

      <ImageUploader
        storeId={storeId}
        onUpload={setNewImage}
      />

      {newImage && (
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Image
        </button>
      )}
    </div>
  )
}
```

---

## Form with Validation

```typescript
import { ImageUploader } from '@/components/ImageUploader'
import { useState } from 'react'

export function ValidatedProductForm({ storeId }: { storeId: string }) {
  const [form, setForm] = useState({
    name: '',
    image: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const newErrors: Record<string, string> = {}

    if (!form.name) newErrors.name = 'Name required'
    if (!form.image) newErrors.image = 'Image required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    // Submit form...
    console.log('Valid form:', form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`w-full border rounded px-3 py-2 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image</label>
        <ImageUploader
          storeId={storeId}
          onUpload={(url) => setForm({ ...form, image: url })}
        />
        {errors.image && (
          <p className="text-sm text-red-500 mt-1">{errors.image}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  )
}
```

---

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `storeId` | string | Yes | - | Store/Business ID |
| `onUpload` | (url: string) => void | Yes | - | Called on success |
| `onError` | (error: string) => void | No | - | Called on error |
| `maxSize` | number | No | 2 | Max size in MB |
| `accept` | string | No | `.jpg,.jpeg,.png,.webp` | Accepted types |

---

## Tips

### Tip 1: Debounce Multiple Uploads
```typescript
const handleUpload = useCallback(
  debounce((url) => setImageUrl(url), 300),
  []
)
```

### Tip 2: Save to Database Immediately
```typescript
async function handleUpload(url: string) {
  await fetch('/api/products/image', {
    method: 'POST',
    body: JSON.stringify({ url })
  })
}
```

### Tip 3: Show Toast on Success
```typescript
import { useToast } from '@/hooks/useToast'

export function MyUploader({ storeId }: { storeId: string }) {
  const { showSuccess } = useToast()

  return (
    <ImageUploader
      storeId={storeId}
      onUpload={(url) => {
        showSuccess('Image uploaded!')
        // ...
      }}
    />
  )
}
```

---

That's it! 🚀
