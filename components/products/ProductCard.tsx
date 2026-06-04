'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import type { Product } from '@/types/models'
import { deleteProduct, toggleProductActive } from '@/lib/actions/product'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  product: Product
  businessId: string
  currency: string
  onEdit: (product: Product) => void
}

export function ProductCard({ product, businessId, currency, onEdit }: Props) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isActive, setIsActive] = useState(product.is_active)

  function handleToggle() {
    const next = !isActive
    setIsActive(next)
    startTransition(async () => {
      const result = await toggleProductActive(product.id, businessId, next)
      if (result.error) setIsActive(!next)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProduct(product.id, businessId)
    })
  }

  return (
    <div className={`group bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 ${
      isActive
        ? 'border-gray-200 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-0.5'
        : 'border-gray-200 opacity-70'
    }`}>

      {/* Image area — fixed 200px height */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
            onError={(e) => {
              // If image fails to load, replace with placeholder
              console.error('❌ Failed to load image:', product.image_url)
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : null}
        
        {/* Placeholder - shown when no image_url or image fails to load */}
        {!product.image_url && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <BoxIcon className="w-10 h-10 text-gray-300" />
            <span className="text-xs text-gray-400 font-medium">No image</span>
          </div>
        )}

        {/* Status badge — top left */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          title="Click to toggle active status"
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm transition-all ${
            isActive
              ? 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600'
              : 'bg-gray-500/80 text-white border-gray-400 hover:bg-gray-600'
          }`}
        >
          {isActive ? '● Active' : '○ Inactive'}
        </button>

        {/* Out of stock overlay */}
        {product.stock_quantity === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 backdrop-blur-sm text-white text-xs font-semibold text-center py-1.5">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Name + description */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">
            {product.name}
          </h3>
          {product.description ? (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          ) : (
            <p className="text-xs text-gray-300 italic">No description</p>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.price, currency)}
          </span>
          {product.stock_quantity > 0 && (
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {product.stock_quantity} in stock
            </span>
          )}
        </div>

        {/* Action buttons */}
        {confirmDelete ? (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-red-600 font-semibold text-center">
              Delete &quot;{product.name}&quot;?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 text-xs font-semibold border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <EditIcon className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 py-2 text-xs font-semibold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
}
function EditIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
}
