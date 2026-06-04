'use client'

import { useEffect } from 'react'
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
  onClose: () => void
}

export function ProductQuickView({ product, businessSlug, businessName, currency, whatsappNumber, onClose }: Props) {
  const { addItem, getItems } = useCartStore()
  const cartItems = getItems(businessSlug)
  const cartItem = cartItems.find((i) => i.product.id === product.id)
  const inCart = !!cartItem
  const outOfStock = product.stock_quantity === 0

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function openWhatsApp() {
    if (!whatsappNumber) return
    const qty = cartItem?.quantity ?? 1
    const message = [
      `Hi ${businessName}! I'd like to order:`,
      '',
      `• ${product.name} x${qty}`,
      `  Price: ${formatCurrency(product.price * qty, currency)}`,
    ].join('\n')
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col sm:flex-row max-h-[92vh]">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="relative w-full sm:w-80 aspect-square sm:aspect-auto sm:h-auto bg-gradient-to-br from-gray-50 to-gray-100 shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
              priority
            />
          ) : (
            <div className="w-full h-full min-h-[240px] flex items-center justify-center">
              <BoxIcon className="w-16 h-16 text-gray-200" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2 pr-8">{product.name}</h2>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.price, currency)}
            </span>
            {product.compare_price && (
              <span className="text-base text-gray-400 line-through">
                {formatCurrency(product.compare_price, currency)}
              </span>
            )}
          </div>

          {/* Stock */}
          {!outOfStock && (
            <p className="text-sm text-emerald-600 font-medium mb-5">
              ✓ {product.stock_quantity} in stock
            </p>
          )}

          {/* Qty controls if in cart */}
          {inCart && !outOfStock && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => useCartStore.getState().updateQuantity(businessSlug, product.id, cartItem.quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium"
                >−</button>
                <span className="w-10 text-center font-bold text-gray-900">{cartItem.quantity}</span>
                <button
                  onClick={() => useCartStore.getState().updateQuantity(businessSlug, product.id, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= product.stock_quantity}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium disabled:opacity-40"
                >+</button>
              </div>
              <span className="text-sm text-indigo-600 font-semibold">
                = {formatCurrency(product.price * cartItem.quantity, currency)}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-auto pt-4">
            {!outOfStock && (
              <>
                {inCart ? (
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CartIcon className="w-5 h-5" />
                    In Cart ({cartItem.quantity}) — View Cart
                  </button>
                ) : (
                  <button
                    onClick={() => addItem(businessSlug, product)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CartIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                )}

                {whatsappNumber && (
                  <button
                    onClick={openWhatsApp}
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    Order on WhatsApp
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
