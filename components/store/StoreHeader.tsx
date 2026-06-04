'use client'

import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'

interface Props {
  businessName: string
  businessDescription: string | null
  logoUrl: string | null
  businessSlug: string
  onCartOpen: () => void
}

export function StoreHeader({ businessName, businessDescription, logoUrl, businessSlug, onCartOpen }: Props) {
  const count = useCartStore((s) => s.getCount(businessSlug))

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-gray-200">
              <Image src={logoUrl} alt={businessName} fill className="object-cover" sizes="36px" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-indigo-700 font-bold text-sm">
                {businessName[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate leading-tight">{businessName}</p>
            {businessDescription && (
              <p className="text-xs text-gray-400 truncate hidden sm:block">{businessDescription}</p>
            )}
          </div>
        </div>

        {/* Cart button */}
        <button
          onClick={onCartOpen}
          className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0"
          aria-label={`Open cart, ${count} items`}
        >
          <CartIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}
