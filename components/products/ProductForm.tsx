'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createProduct, updateProduct, type ProductFormState } from '@/lib/actions/product'
import type { Product } from '@/types/models'
import { ImageUploader } from '@/components/ImageUploader'

interface Props {
  businessId: string
  businessSlug: string
  product?: Product          // if provided → edit mode
  onSuccess: () => void
  onCancel: () => void
}

const initial: ProductFormState = {}

export function ProductForm({ businessId, product, onSuccess, onCancel }: Props) {
  const isEdit = !!product

  // Bind the action to businessId (and productId for edit)
  const boundAction = isEdit
    ? updateProduct.bind(null, product.id, businessId)
    : createProduct.bind(null, businessId)

  const [state, action] = useActionState(boundAction, initial)
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url ?? null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Close on success
  useEffect(() => {
    if (state.success) onSuccess()
  }, [state.success, onSuccess])

  function handleImageUpload(url: string) {
    console.log('✅ [ProductForm] Image uploaded successfully:', url)
    setImageUrl(url)
    setUploadError(null)
    setIsUploading(false)
  }

  function handleImageError(error: string) {
    console.error('❌ [ProductForm] Image upload error:', error)
    setUploadError(error)
    setIsUploading(false)
    // Don't block form submission - user can still save product
  }

  function handleImageUploadStart() {
    setIsUploading(true)
    setUploadError(null)
  }

  // Wrap the action to include the imageUrl in formData
  async function handleSubmit(formData: FormData) {
    console.log('📝 [ProductForm] Submitting form with imageUrl:', imageUrl)
    
    // Add imageUrl to formData if we have one
    // If upload failed, imageUrl will be null and product saves without image
    if (imageUrl) {
      formData.append('image_url', imageUrl)
    }
    
    // Call the original action
    return action(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {state.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertIcon className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">Image upload failed</p>
            <p className="text-sm text-yellow-700">{uploadError}</p>
            <p className="text-xs text-yellow-600 mt-1">
              💡 You can still save the product - the image is optional
            </p>
          </div>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Product Image <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <ImageUploader
          storeId={businessId}
          onUpload={handleImageUpload}
          onError={handleImageError}
        />
        {state.fieldErrors?.image && (
          <p className="text-xs text-red-600 mt-2">{state.fieldErrors.image}</p>
        )}
        
        {/* Show existing image preview if editing and no new upload */}
        {isEdit && imageUrl && imageUrl === product?.image_url && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Current Image:</p>
            <img
              src={imageUrl}
              alt="Current product"
              className="w-full max-w-xs h-auto rounded"
            />
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label htmlFor="p-name" className="block text-sm font-medium text-gray-900 mb-1.5">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          id="p-name"
          name="name"
          type="text"
          defaultValue={product?.name}
          required
          autoFocus
          autoComplete="off"
          placeholder="e.g. Basmati Rice 5kg"
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
            state.fieldErrors?.name ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-red-600 mt-1">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="p-desc" className="block text-sm font-medium text-gray-900 mb-1.5">
          Description <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="p-desc"
          name="description"
          rows={2}
          defaultValue={product?.description ?? ''}
          placeholder="Short product description..."
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Price + Stock row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="p-price" className="block text-sm font-medium text-gray-900 mb-1.5">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              Rs.
            </span>
            <input
              id="p-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.price}
              required
              placeholder="0"
              className={`w-full border rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                state.fieldErrors?.price ? 'border-red-400' : 'border-gray-300'
              }`}
            />
          </div>
          {state.fieldErrors?.price && (
            <p className="text-xs text-red-600 mt-1">{state.fieldErrors.price}</p>
          )}
        </div>

        <div>
          <label htmlFor="p-stock" className="block text-sm font-medium text-gray-900 mb-1.5">
            Stock Qty
          </label>
          <input
            id="p-stock"
            name="stock_quantity"
            type="number"
            min="0"
            defaultValue={product?.stock_quantity ?? 0}
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Active toggle (edit only) */}
      {isEdit && (
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">Active</p>
            <p className="text-xs text-gray-500">Visible in your store</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              value="true"
              defaultChecked={product?.is_active ?? true}
              className="sr-only peer"
              onChange={(e) => {
                // Set hidden field value based on checkbox
                const hidden = e.target.form?.querySelector('input[name="is_active"][type="hidden"]') as HTMLInputElement | null
                if (hidden) hidden.value = e.target.checked ? 'true' : 'false'
              }}
            />
            <div className="w-10 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  )
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      title={pending ? 'Saving product...' : 'Save product (image upload happens automatically)'}
    >
      {pending && <SpinnerIcon className="w-4 h-4 animate-spin" />}
      {pending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
    </button>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
