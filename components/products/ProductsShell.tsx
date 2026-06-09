'use client'

import { useState } from 'react'
import { ProductCard } from './ProductCard'
import { ProductModal } from './ProductModal'
import type { Product } from '@/types/models'

interface Props {
  products: Product[]
  businessId: string
  businessSlug: string
  currency: string
}

export function ProductsShell({ products, businessId, businessSlug, currency }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  function openAdd() {
    setEditingProduct(undefined)
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProduct(undefined)
  }

  const activeCount = products.filter((p) => p.is_active).length
  const outOfStock = products.filter((p) => p.stock_quantity === 0).length

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-gray-400 mt-1">
            {products.length === 0
              ? 'Add your first product to start selling'
              : `${products.length} total · ${activeCount} active · ${outOfStock} out of stock`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats row */}
      {products.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Total Products</p>
            <p className="text-xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Active</p>
            <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">Out of Stock</p>
            <p className="text-xl font-bold text-red-500">{outOfStock}</p>
          </div>
        </div>
      )}

      {/* Product grid */}
      {products.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              businessId={businessId}
              currency={currency}
              onEdit={openEdit}
            />
          ))}

          {/* Add new tile */}
          <button
            onClick={openAdd}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all duration-200 min-h-[280px] group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <PlusIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500 group-hover:text-indigo-700 transition-colors">
                Add Product
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Click to add a new item</p>
            </div>
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          businessId={businessId}
          businessSlug={businessSlug}
          product={editingProduct}
          onClose={closeModal}
        />
      )}
    </>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-5">
        <BoxIcon className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-2">No products yet</h2>
      <p className="text-sm text-gray-400 mb-7 max-w-xs leading-relaxed">
        Add your first product so customers can browse and order from your store.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <PlusIcon className="w-4 h-4" />
        Add your first product
      </button>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
}
function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
}
