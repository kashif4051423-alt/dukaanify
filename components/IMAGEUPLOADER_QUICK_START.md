# ImageUploader - Quick Start

Ready-to-use component for product image uploads.

---

## Import

```typescript
import { ImageUploader } from '@/components/ImageUploader'
```

---

## Minimal Usage

```typescript
<ImageUploader
  storeId="store-123"
  onUpload={(url) => console.log(url)}
/>
```

---

## In Your Form

```typescript
'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ImageUploader'

export function ProductForm({ storeId }: { storeId: string }) {
  const [imageUrl, setImageUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl) {
      alert('Please upload an image')
      return
    }

    // Save product with imageUrl...
    console.log('Saving product with image:', imageUrl)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Product Image</label>
        <ImageUploader
          storeId={storeId}
          onUpload={setImageUrl}
          onError={(error) => alert(`Error: ${error}`)}
        />
      </div>

      {/* Other form fields... */}

      <button
        type="submit"
        disabled={!imageUrl}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        Create Product
      </button>
    </form>
  )
}
```

---

## Props

| Prop | Type | Required |
|------|------|----------|
| `storeId` | string | Yes |
| `onUpload` | (url: string) => void | Yes |
| `onError` | (error: string) => void | No |
| `maxSize` | number (MB) | No |
| `accept` | string | No |

---

## Features

✅ Drag & drop
✅ File preview
✅ Progress bar
✅ Error messages
✅ Success state
✅ Tailwind CSS
✅ Fully typed

---

## Done! 🎉

See `IMAGE_UPLOADER_GUIDE.md` for full documentation.
See `IMAGE_UPLOADER_EXAMPLES.md` for more examples.
