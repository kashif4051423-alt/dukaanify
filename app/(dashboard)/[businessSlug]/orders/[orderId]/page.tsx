import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { StatusBadge } from '@/components/orders/StatusBadge'
import { StatusUpdater } from '@/components/orders/StatusUpdater'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { OrderStatus } from '@/types/models'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ businessSlug: string; orderId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params
  return { title: `Order #${orderId.slice(0, 8).toUpperCase()} — Dukaanify` }
}

export default async function OrderDetailPage({ params }: Props) {
  const { businessSlug, orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // ── 1. Verify business ownership ─────────────────────────
  const { data: business } = await supabase
    .from('businesses')
    .select('id, currency')
    .eq('slug', businessSlug)
    .eq('owner_id', user.id)
    .single()

  if (!business) notFound()

  // ── 2. Fetch order (no join — avoids RLS issues) ──────────
  const { data: orderRaw } = await supabase
    .from('orders')
    .select('id, status, total_amount, notes, payment_method, created_at, updated_at, customer_id')
    .eq('id', orderId)
    .eq('business_id', business.id)
    .single()

  if (!orderRaw) notFound()

  // ── 3. Fetch customer separately ──────────────────────────
  let customer: {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
  } | null = null

  if (orderRaw.customer_id) {
    const { data: cust } = await supabase
      .from('customers')
      .select('id, name, email, phone, address')
      .eq('id', orderRaw.customer_id)
      .single()
    customer = cust ?? null
  }

  // ── 4. Fetch order items separately ───────────────────────
  const { data: itemsRaw } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price, total_price, product_id')
    .eq('order_id', orderId)

  // ── 5. Fetch product details for each item ────────────────
  type ItemRow = {
    id: string
    quantity: number
    unit_price: number
    total_price: number
    product_id: string
    product_name: string
    product_image: string | null
    product_sku: string | null
  }

  const items: ItemRow[] = []
  if (itemsRaw && itemsRaw.length > 0) {
    const productIds = itemsRaw.map((i) => i.product_id)
    const { data: productsRaw } = await supabase
      .from('products')
      .select('id, name, image_url, sku')
      .in('id', productIds)

    const productMap = new Map(
      (productsRaw ?? []).map((p) => [p.id, p])
    )

    for (const item of itemsRaw) {
      const prod = productMap.get(item.product_id)
      items.push({
        id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        product_id: item.product_id,
        product_name: prod?.name ?? 'Deleted product',
        product_image: prod?.image_url ?? null,
        product_sku: prod?.sku ?? null,
      })
    }
  }

  const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
  const currentIdx = STATUS_FLOW.indexOf(orderRaw.status as OrderStatus)

  const paymentLabel: Record<string, string> = {
    cod: 'Cash on Delivery',
    jazzcash: 'JazzCash',
    easypaisa: 'Easypaisa',
    sadapay: 'SadaPay',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href={`/${businessSlug}/orders`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{orderRaw.id.slice(0, 8).toUpperCase()}
            </h1>
            <StatusBadge status={orderRaw.status as OrderStatus} />
          </div>
          <p className="text-sm text-gray-500">
            Placed on {formatDate(orderRaw.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Update status:</span>
          <StatusUpdater
            orderId={orderRaw.id}
            currentStatus={orderRaw.status as OrderStatus}
            businessSlug={businessSlug}
          />
        </div>
      </div>

      {/* Progress tracker */}
      {orderRaw.status !== 'cancelled' && (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Order Progress
          </p>
          <div className="flex items-center">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentIdx
              const active = i === currentIdx
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done
                        ? active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {done && !active ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium capitalize whitespace-nowrap ${done ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {s}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < currentIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Items — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">No items found</p>
              ) : items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    {item.product_image ? (
                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BoxIcon className="w-6 h-6 text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.product_name}</p>
                    {item.product_sku && (
                      <p className="text-xs text-gray-400 mt-0.5">SKU: {item.product_sku}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatCurrency(item.unit_price, business.currency)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 shrink-0">
                    {formatCurrency(item.total_price, business.currency)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(orderRaw.total_amount), business.currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-indigo-600 text-lg">
                  {formatCurrency(Number(orderRaw.total_amount), business.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {orderRaw.notes && (
            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
              <h2 className="font-semibold text-gray-900 mb-2">Order Notes</h2>
              <p className="text-sm text-gray-600">{orderRaw.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Customer details */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
            {customer ? (
              <div className="space-y-3">
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-indigo-700 font-bold text-sm">
                      {customer.name[0].toUpperCase()}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                </div>

                {/* Phone */}
                {customer.phone && (
                  <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                    <PhoneIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{customer.phone}</p>
                    </div>
                  </div>
                )}

                {/* Email */}
                {customer.email && (
                  <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                    <MailIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{customer.email}</p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {customer.address && (
                  <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                    <MapIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Delivery Address</p>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{customer.address}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                <p className="text-sm text-gray-400">No customer info saved</p>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-bold text-gray-800 text-xs">
                  #{orderRaw.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-700">{formatDate(orderRaw.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-semibold text-gray-800">
                  {paymentLabel[orderRaw.payment_method ?? 'cod'] ?? orderRaw.payment_method ?? 'COD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="text-gray-700">{items.length}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                <span className="text-gray-800">Total</span>
                <span className="text-indigo-600 text-base">
                  {formatCurrency(Number(orderRaw.total_amount), business.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
}
function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
}
function BoxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
}
function PhoneIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
}
function MailIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
}
function MapIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
}
