# 🚀 Start Using Image Upload

Your reusable image upload utility is ready. Choose how you want to proceed.

---

## 📍 Files Created

### Main Utility
- **`lib/uploadImage.ts`** - The utility (production-ready, fully typed)

### Documentation
- **`UPLOAD_IMAGE_README.md`** - Overview and reference
- **`UPLOAD_IMAGE_QUICK_START.md`** - Copy-paste examples
- **`UPLOAD_IMAGE_GUIDE.md`** - Complete API reference
- **`UPLOAD_IMAGE_EXAMPLES.md`** - Real-world integration

---

## ⚡ 30-Second Start

### 1. Import
```typescript
import { uploadProductImage } from '@/lib/uploadImage'
```

### 2. Use in Your Component
```typescript
const imageUrl = await uploadProductImage(file, storeId)
```

### 3. Display
```typescript
<img src={imageUrl} alt="Product" />
```

**Done!** ✅

---

## 📚 Which File to Read?

### I Just Want to Use It
→ **`UPLOAD_IMAGE_QUICK_START.md`** (2 min read)

### I Want to Understand It
→ **`UPLOAD_IMAGE_README.md`** (5 min read)

### I Need Complete Details
→ **`UPLOAD_IMAGE_GUIDE.md`** (15 min read)

### I Want Real Examples
→ **`UPLOAD_IMAGE_EXAMPLES.md`** (10 min read)

### I Want Everything
→ Read all files in order above

---

## 🎯 Common Use Cases

### Upload in Component
```typescript
'use client'

import { uploadProductImage } from '@/lib/uploadImage'

async function handleUpload(file: File, storeId: string) {
  try {
    const url = await uploadProductImage(file, storeId)
    console.log('Uploaded:', url)
  } catch (error) {
    console.error('Upload failed:', error.message)
  }
}
```

See: `UPLOAD_IMAGE_EXAMPLES.md` → Example 1

### Upload in Server Action
```typescript
'use server'

import { uploadProductImage } from '@/lib/uploadImage'

export async function createProduct(formData: FormData, storeId: string) {
  const file = formData.get('image') as File
  const url = await uploadProductImage(file, storeId)
  // Save to database...
}
```

See: `UPLOAD_IMAGE_EXAMPLES.md` → Example 5

### Drag & Drop Upload
Already have example code for this!

See: `UPLOAD_IMAGE_EXAMPLES.md` → Example 2

### Delete Image
```typescript
import { deleteProductImage } from '@/lib/uploadImage'

await deleteProductImage(imageUrl)
```

See: `UPLOAD_IMAGE_EXAMPLES.md` → Example 3

### Multiple Uploads
Already have example code for this!

See: `UPLOAD_IMAGE_EXAMPLES.md` → Example 4

---

## ✨ Features

✅ **Upload** - Easy image upload with validation
✅ **Validation** - File type (jpg, png, webp) & size (max 2MB)
✅ **Public URLs** - Get public URL immediately after upload
✅ **Delete** - Delete images when products are removed
✅ **Signed URLs** - Temporary access links
✅ **List Images** - See all images in a store folder
✅ **Error Handling** - Specific error messages
✅ **TypeScript** - Full type safety
✅ **Multi-Tenant** - Organized by storeId

---

## 📋 Checklist

- [ ] Read `UPLOAD_IMAGE_README.md`
- [ ] Check `UPLOAD_IMAGE_QUICK_START.md` for your use case
- [ ] Copy example from `UPLOAD_IMAGE_EXAMPLES.md`
- [ ] Integrate into your component
- [ ] Test upload
- [ ] Test delete
- [ ] Save URL to database
- [ ] Deploy

---

## 🔧 Function Signatures

```typescript
// Upload image
uploadProductImage(file: File, storeId: string): Promise<string>

// Delete image
deleteProductImage(publicUrl: string): Promise<void>

// Get temporary URL
getSignedImageUrl(publicUrl: string, expiresIn?: number): Promise<string>

// List store images
listStoreImages(storeId: string): Promise<any[]>

// Get config
uploadConfig: { allowedTypes, maxFileSize, bucketName }
```

---

## 📁 File Path Structure

Images are stored at:
```
product-images/
└── {storeId}/
    └── 1704067200000-abc123.jpg
```

Public URL:
```
https://[project].supabase.co/storage/v1/object/public/product-images/{storeId}/1704067200000-abc123.jpg
```

---

## 🛡️ Validation

Automatic validation:
- ✅ File type: jpg, png, webp only
- ✅ File size: max 2MB
- ✅ File provided
- ✅ storeId provided

Error messages are specific:
- "Invalid file type. Only jpg, png, webp are allowed."
- "File size exceeds 2MB limit. Current size: X MB"

---

## 🚀 Quick Integration

### In Your Product Form

```typescript
'use client'

import { uploadProductImage } from '@/lib/uploadImage'
import { useState } from 'react'

export function ProductForm({ storeId }: { storeId: string }) {
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadProductImage(file, storeId)
      setImageUrl(url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleUpload}
        disabled={uploading}
      />
      {imageUrl && <img src={imageUrl} alt="Preview" className="max-w-xs" />}
    </>
  )
}
```

**That's it!** 30 lines of code. The utility handles everything else.

---

## 🎓 Learning Path

**Total Time: ~30 minutes**

1. **Quick Overview** (2 min)
   - Read: `UPLOAD_IMAGE_README.md`

2. **Basics** (5 min)
   - Read: `UPLOAD_IMAGE_QUICK_START.md`
   - See: API quick reference

3. **Your Use Case** (10 min)
   - Find matching example in `UPLOAD_IMAGE_EXAMPLES.md`
   - Copy and adapt

4. **Deep Dive** (13 min)
   - Read: `UPLOAD_IMAGE_GUIDE.md`
   - Learn all details and error handling

5. **Code Review** (optional)
   - Read: `lib/uploadImage.ts`
   - Understand implementation

---

## 🔗 Integration Points

This utility works with:

✅ Your existing Supabase client (`lib/supabase/client.ts`)
✅ Product creation flow
✅ Product updates
✅ Product deletion (cleanup)
✅ Product display (public URLs)

---

## 📊 What Happens

### On Upload
```
User selects file
    ↓
File validated (type, size)
    ↓
Random filename generated
    ↓
Uploaded to: product-images/{storeId}/filename
    ↓
Public URL returned: https://...
    ↓
You save URL to database
```

### On Delete
```
You call deleteProductImage(url)
    ↓
URL parsed to extract file path
    ↓
File deleted from storage
    ↓
(You delete product from database)
```

---

## 💡 Pro Tips

1. **Save URLs to database** - Don't regenerate them
2. **Show user feedback** - Use loading state during upload
3. **Handle errors gracefully** - Show specific error messages
4. **Clean up on delete** - Delete from storage AND database
5. **Cache public URLs** - They're stable and don't expire

---

## ❓ Common Questions

### How do I change the file size limit?
Edit `MAX_FILE_SIZE` in `lib/uploadImage.ts`

### How do I add more file types?
Edit `ALLOWED_TYPES` in `lib/uploadImage.ts`

### Can I use this in server actions?
Yes! Just import and use the same way.

### Do I need to set up anything?
No, uses existing Supabase setup. Just ensure `product-images` bucket exists.

### Where are files stored?
`product-images/{storeId}/filename` in Supabase Storage

### Can multiple users upload?
Yes! Each user uploads to their own storeId folder via RLS policies.

---

## 🎯 Next Step

Pick one:

1. **Just need to use it?**
   → Copy from `UPLOAD_IMAGE_QUICK_START.md`

2. **Want to understand it?**
   → Read `UPLOAD_IMAGE_README.md`

3. **Need detailed examples?**
   → Check `UPLOAD_IMAGE_EXAMPLES.md`

4. **Want complete reference?**
   → Read `UPLOAD_IMAGE_GUIDE.md`

---

## ✅ Ready to Go

Everything is built, tested, and documented.

Just import `uploadProductImage` and start uploading! 🚀

```typescript
import { uploadProductImage } from '@/lib/uploadImage'

const url = await uploadProductImage(file, storeId)
```

**That's all you need to know to get started.**

---

**Questions?** Check the documentation files above.

**Ready to integrate?** See `UPLOAD_IMAGE_EXAMPLES.md`.

**Happy coding!** 🎉
