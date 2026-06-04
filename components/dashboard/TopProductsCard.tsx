'use client'

interface Product {
  name: string
  quantity: number
}

interface Props {
  products: Product[]
  currency: string
}

export function TopProductsCard({ products, currency }: Props) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-center text-gray-500">
        No sales yet
      </div>
    )
  }

  const maxQuantity = Math.max(...products.map((p) => p.quantity), 1)
  const scale = 100 / maxQuantity

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Top Products by Orders</h3>
      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-12">{i + 1}.</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </p>
              <div className="h-2 bg-gray-100 rounded mt-1">
                <div
                  className="h-full bg-indigo-500 rounded transition-all"
                  style={{ width: `${product.quantity * scale}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-900 w-8 text-right">
              {product.quantity}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
