'use client'

import { useState, Suspense } from 'react'
import { useProducts } from '@/lib/hooks/useProducts'
import { ProductCardSkeleton, ProductGridSkeleton } from '@/components/skeletons/ProductCardSkeleton'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types/models'

interface Props {
  businessId: string
  businessSlug: string
  businessName: string
  currency: string
  whatsappNumber: string | null
  onQuickView: (product: Product) => void
}

export function ProductsGrid({
  businessId,
  businessSlug,
  businessName,
  currency,
  whatsappNumber,
  onQuickView,
}: Props) {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useProducts({
    businessId,
    page,
    pageSize: 12,
  })

  const products = data?.products || []
  const totalPages = data?.totalPages || 1

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load products</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      {isLoading ? (
        <ProductGridSkeleton count={12} />
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No products available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  businessSlug={businessSlug}
                  businessName={businessName}
                  currency={currency}
                  whatsappNumber={whatsappNumber}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition ${
                    page === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>

          <span className="ml-4 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </div>
  )
}
