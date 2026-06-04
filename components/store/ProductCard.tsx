'use client'

import { memo } from 'react'
import Image from 'next/image'
import type { Product } from '@/types/models'
import { useCartStore } from '@/lib/store/cart'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  product: Product
  businessSlug: string
  businessName: string
  currency: string
  whatsappNumber: string | null
  onQuickView: (product: Product) => void
}

function ProductCardComponent({ product, businessSlug, businessName, currency, whatsappNumber, onQuickView }: Props) {
  const { addItem, getItems } = useCartStore()
  const cartItems = getItems(businessSlug)
  const cartItem = cartItems.find((i) => i.product.id === product.id)
  const inCart = !!cartItem
  const outOfStock = product.stock_quantity === 0

  function openWhatsApp(e: React.MouseEvent) {
    e.stopPropagation()
    if (!whatsappNumber) return
    const message = `Hi ${businessName}! I'd like to order:\n\n• ${product.name}\n\nPrice: ${formatCurrency(product.price, currency)}`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    addItem(businessSlug, product)
  }

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BoxIcon className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-2.5">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price, currency)}
            </span>
            {product.stock_quantity > 0 && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {product.stock_quantity} left
              </span>
            )}
          </div>

          {/* Actions */}
          {!outOfStock && (
            <div className="flex gap-2">
              {/* Add to cart */}
              {inCart ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-between bg-indigo-50 rounded-xl px-2.5 py-1.5"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      useCartStore.getState().updateQuantity(businessSlug, product.id, cartItem.quantity - 1)
                    }}
                    className="w-6 h-6 rounded-lg bg-white border border-indigo-200 text-indigo-600 font-bold text-sm flex items-center justify-center hover:bg-indigo-100 transition-colors"
                  >−</button>
                  <span className="text-sm font-bold text-indigo-700">{cartItem.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      useCartStore.getState().updateQuantity(businessSlug, product.id, cartItem.quantity + 1)
                    }}
                    disabled={cartItem.quantity >= product.stock_quantity}
                    className="w-6 h-6 rounded-lg bg-white border border-indigo-200 text-indigo-600 font-bold text-sm flex items-center justify-center hover:bg-indigo-100 transition-colors disabled:opacity-40"
                  >+</button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CartIcon className="w-3.5 h-3.5" />
                  Add
                </button>
              )}

              {/* WhatsApp button */}
              {whatsappNumber && (
                <button
                  onClick={openWhatsApp}
                  title="Order on WhatsApp"
                  className="w-10 h-10 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
}
function CartIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export const ProductCard = memo(ProductCardComponent)
