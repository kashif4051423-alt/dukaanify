# ImageUploader Component - Complete Guide

Reusable drag-and-drop image upload component for Dukaanify product forms.

---

## Overview

The `ImageUploader` component provides a complete image upload experience with:

- 📁 **Drag and drop support**
- 👁️ **Image preview** (before and after)
- 📊 **Upload progress** bar
- ✅ **Success state** with URL display
- ❌ **Error handling** with messages
- 🎨 **Tailwind CSS** styling
- ♿ **Accessible** with ARIA labels

---

## Quick Start

### 1. Import

```typescript
import { ImageUploader } from '@/components/ImageUploader'
```

### 2. Use in Form

```typescript
<ImageUploader
  storeId="store-123"
  onUpload={(url) => {
    console.log('Image uploaded:', url)
    // Save URL to form state or database
  }}
/>
```

### 3. Handle Image URL

```typescript
const [imageUrl, setImageUrl] = useState('')

<ImageUploader
  storeId={storeId}
  onUpload={(url) => setImageUrl(url)}
/>
```

**Done!** The component handles everything else.

---

## Props

### Required Props

#### `storeId: string`
The store/business ID for organizing uploads.

```typescript
<ImageUploader storeId="business-123" onUpload={handleUpload} />
```

#### `onUpload: (imageUrl: string) => void`
Callback function called when upload succeeds. Receives the public URL.

```typescript
<ImageUploader
  storeId={storeId}
  onUpload={(url) => {
    setImageUrl(url)
    console.log('Uploaded:', url)
  }}
/>
```

### Optional Props

#### `onError?: (error: string) => void`
Callback function called when upload fails. Receives error message.

```typescript
<ImageUploader
  storeId={storeId}
  onUpload={handleUpload}
  onError={(error) => {
    console.error('Upload failed:', error)
    // Show toast or alert
  }}
/>
```

#### `maxSize?: number`
Maximum file size in MB. Default: 2

```typescript
<ImageUploader
  storeId={storeId}
  onUpload={handleUpload}
  maxSize={5} // 5MB instead of 2MB
/>
```

#### `accept?: string`
Accepted file types. Default: `.jpg,.jpeg,.png,.webp`

```typescript
<ImageUploader
  storeId={storeId}
  onUpload={handleUpload}
  accept=".jpg,.jpeg,.png,.webp,.gif" // Add GIF
/>
```

---

## Usage Examples

### Example 1: Basic Product Form

```typescript
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'

export function CreateProductForm({ storeId }: { storeId: string }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.imageUrl) {
      alert('Please upload an image')
      return
    }

    // Save product
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      alert('Product created!')
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full border rounded px-3 py-2 h-24"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-2">Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Image</label>
        <ImageUploader
          storeId={storeId}
          onUpload={(url) =>
            setFormData({ ...formData, imageUrl: url })
          }
          onError={(error) => alert(`Upload error: ${error}`)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!formData.imageUrl}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        Create Product
      </button>
    </form>
  )
}
```

### Example 2: Edit Product (Replace Image)

```typescript
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { deleteProductImage } from '@/lib/uploadImage'

export function EditProductForm({
  storeId,
  product
}: {
  storeId: string
  product: { id: string; name: string; imageUrl: string }
}) {
  const [newImageUrl, setNewImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)

    try {
      // Delete old image if new one was uploaded
      if (newImageUrl && newImageUrl !== product.imageUrl) {
        await deleteProductImage(product.imageUrl)
      }

      // Update product with new image
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          imageUrl: newImageUrl || product.imageUrl
        })
      })

      if (response.ok) {
        alert('Product updated!')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>

      {/* Current Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Current Image</label>
        <div className="w-full max-w-xs">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto rounded"
          />
        </div>
      </div>

      {/* Upload New Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Update Image</label>
        <ImageUploader
          storeId={storeId}
          onUpload={(url) => setNewImageUrl(url)}
          onError={(error) => alert(`Upload error: ${error}`)}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
```

### Example 3: With Toast Notifications

```typescript
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { useToast } from '@/hooks/useToast' // Your toast hook

export function ProductFormWithToast({
  storeId
}: {
  storeId: string
}) {
  const [imageUrl, setImageUrl] = useState('')
  const { success, error } = useToast()

  function handleUpload(url: string) {
    setImageUrl(url)
    success('Image uploaded successfully!')
  }

  function handleError(errorMsg: string) {
    error(`Upload failed: ${errorMsg}`)
  }

  return (
    <div>
      <ImageUploader
        storeId={storeId}
        onUpload={handleUpload}
        onError={handleError}
      />

      {imageUrl && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm font-medium">Image URL:</p>
          <p className="text-xs text-gray-600 break-all">{imageUrl}</p>
        </div>
      )}
    </div>
  )
}
```

### Example 4: Multiple Product Gallery

```typescript
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'

export function ProductGalleryUpload({
  storeId
}: {
  storeId: string
}) {
  const [images, setImages] = useState<string[]>([])

  function handleUpload(url: string) {
    setImages([...images, url])
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <ImageUploader storeId={storeId} onUpload={handleUpload} />

      {/* Gallery */}
      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### Example 5: Server Action Integration

```typescript
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { createProductAction } from '@/app/actions/products'

export function CreateProductWithServer({
  storeId
}: {
  storeId: string
}) {
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (!imageUrl) {
      alert('Please upload an image')
      return
    }

    setIsSubmitting(true)

    try {
      formData.append('imageUrl', imageUrl)
      formData.append('storeId', storeId)

      const result = await createProductAction(formData)

      if (result.success) {
        alert('Product created!')
        setImageUrl('')
      } else {
        alert(`Error: ${result.error}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Image</label>
        <ImageUploader
          storeId={storeId}
          onUpload={setImageUrl}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          name="name"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={!imageUrl || isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  )
}
```

---

## Styling & Customization

### Tailwind Classes Used

The component uses these Tailwind utilities:
- Layout: `w-full`, `space-y-4`, `max-w-xs`
- Borders: `border-2`, `border-dashed`, `rounded-lg`
- Colors: `bg-blue-50`, `border-blue-500`, `text-blue-600`
- States: `hover:`, `disabled:`, `opacity-75`
- Images: `aspect-square`, `object-cover`

### Customizing Colors

To change colors, modify the className strings in the component:

```typescript
// Change upload area border color when dragging
${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}

// Change button color
className="bg-green-600 hover:bg-green-700"
```

### Customizing Layout

Wrap the component to change spacing:

```typescript
<div className="w-full max-w-2xl mx-auto">
  <ImageUploader storeId={storeId} onUpload={handleUpload} />
</div>
```

---

## Component Behavior

### Upload Flow

1. User selects or drags file
2. Preview shows immediately
3. Progress bar animates during upload
4. On success:
   - Success message displays
   - URL shown
   - `onUpload()` callback called
5. User can upload another or clear

### States

| State | Display |
|-------|---------|
| **Idle** | Upload icon, "Drag and drop" text, Select button |
| **Dragging** | Blue border and background |
| **Uploading** | Preview, progress bar, "Uploading..." |
| **Success** | Preview, success message, URL, action buttons |
| **Error** | Error message, dismiss button |

---

## Error Handling

### Built-in Errors

```
"Invalid file type. Only jpg, png, webp are allowed."
"File size exceeds 2MB limit. Current size: X MB"
"Upload failed: [Supabase error]"
"Please drop an image file"
```

### Error Handling Pattern

```typescript
<ImageUploader
  storeId={storeId}
  onUpload={handleUpload}
  onError={(error) => {
    if (error.includes('file type')) {
      // Handle invalid type
    } else if (error.includes('size')) {
      // Handle too large
    } else {
      // Handle other errors
    }
  }}
/>
```

---

## Accessibility

The component includes:

- ✅ `aria-label` on file input
- ✅ Semantic HTML (`label`, `button`)
- ✅ Proper color contrast
- ✅ Keyboard navigable
- ✅ Descriptive button text
- ✅ Error messages for screen readers

---

## Performance

### Optimizations

- ✅ Image preview uses FileReader API (no upload)
- ✅ Progress simulation is smooth
- ✅ File input reset prevents memory leaks
- ✅ Uses React.useRef for input access
- ✅ Callbacks are properly typed

### Best Practices

1. **Memoize callbacks** if component in list
   ```typescript
   const handleUpload = useCallback((url) => {
     setImages([...images, url])
   }, [images])
   ```

2. **Use with React.memo** if reused
   ```typescript
   export const MemoizedUploader = React.memo(ImageUploader)
   ```

---

## Common Issues & Solutions

### Issue: Component not uploading
**Solution:** Check `storeId` is valid and user is authenticated

### Issue: Preview not showing
**Solution:** Ensure browser supports FileReader API

### Issue: Progress bar not moving
**Solution:** It's simulated - actual upload speed varies by network

### Issue: File input not clickable after upload
**Solution:** Component resets it automatically - shouldn't happen

---

## Integration Checklist

- [ ] Import component in your form
- [ ] Pass `storeId` prop
- [ ] Handle `onUpload` callback
- [ ] Test drag & drop
- [ ] Test file selection
- [ ] Test with small files
- [ ] Test with large files
- [ ] Test error scenarios
- [ ] Verify image URLs are saved
- [ ] Deploy to production

---

## Summary

The `ImageUploader` component provides:

✅ **Easy integration** - Just pass props and handle callback
✅ **Great UX** - Drag-drop, preview, progress, feedback
✅ **Error handling** - Specific messages for users
✅ **Accessible** - WCAG compliant
✅ **Performant** - Optimized rendering
✅ **Styled** - Beautiful Tailwind design
✅ **Production-ready** - Tested and documented

Use it in your forms and provide great upload experience! 🚀
