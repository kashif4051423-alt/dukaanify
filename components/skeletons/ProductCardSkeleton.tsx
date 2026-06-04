'use client'

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse border border-gray-100">
      {/* Image skeleton */}
      <div className="w-full h-40 bg-gray-200" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4" />

        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/2" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded w-full mt-4" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
