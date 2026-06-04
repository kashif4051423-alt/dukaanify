'use client'

import { useState } from 'react'
import { StoreHeader } from './StoreHeader'
import { ProductCard } from './ProductCard'
import { ProductQuickView } from './ProductQuickView'
import { CartSidebar } from './CartSidebar'
import { CheckoutModal } from './CheckoutModal'
import type { Business, Product } from '@/types/models'

interface Props {
  business: Business
  products: Product[]
}

export function StorefrontShell({ business, products }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const currency = business.currency ?? 'PKR'
  const whatsapp = business.whatsapp_number ?? null

  function openCheckout() {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  // Featured = first 4 products (or those with compare_price set)
  const featured = products.filter((p) => p.compare_price).slice(0, 4)
  const hasFeatured = featured.length > 0

  return (
    <>
      <StoreHeader
        businessName={business.name}
        businessDescription={business.description}
        logoUrl={business.logo_url}
        businessSlug={business.slug}
        onCartOpen={() => setCartOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Hero banner */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl overflow-hidden">
          {/* Background bakery image */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative px-6 py-8 sm:px-10 text-white">
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome to</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{business.name}</h1>
            {business.description && (
              <p className="text-indigo-100 text-sm max-w-lg">{business.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                {products.length} Products
              </span>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-[#25D366] text-white px-3 py-1 rounded-full font-medium flex items-center gap-1.5 hover:bg-[#20bd5a] transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Featured / On Sale section */}
        {hasFeatured && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">🔥 On Sale</h2>
              <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-2.5 py-1 rounded-full">
                {featured.length} deals
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  businessSlug={business.slug}
                  businessName={business.name}
                  currency={currency}
                  whatsappNumber={whatsapp}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* All products */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {hasFeatured ? 'All Products' : 'Our Products'}
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  businessSlug={business.slug}
                  businessName={business.name}
                  currency={currency}
                  whatsappNumber={whatsapp}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-200">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <BoxIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500">No products yet</p>
              <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
            </div>
          )}
        </section>

        {/* WhatsApp CTA footer */}
        {whatsapp && (
          <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">Have questions?</p>
              <p className="text-sm text-gray-500">Chat with us directly on WhatsApp</p>
            </div>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi ${business.name}! I have a question about your products.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shrink-0"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        )}
      </main>

      {/* Product quick-view modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          businessSlug={business.slug}
          businessName={business.name}
          currency={currency}
          whatsappNumber={whatsapp}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Cart sidebar */}
      <CartSidebar
        businessSlug={business.slug}
        businessName={business.name}
        currency={currency}
        whatsappNumber={whatsapp}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={openCheckout}
      />

      {/* Checkout modal */}
      <CheckoutModal
        businessId={business.id}
        businessSlug={business.slug}
        businessName={business.name}
        currency={currency}
        whatsappNumber={whatsapp}
        paymentConfig={{
          jazzcash:  business.jazzcash_number ?? null,
          easypaisa: business.easypaisa_number ?? null,
          sadapay:   business.sadapay_number ?? null,
        }}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
