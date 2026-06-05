import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { StatusUpdater } from './StatusUpdater'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { OrderStatus } from '@/types/models'

export interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

export interface OrderRow {
  id: string
  status: OrderStatus
  total_amount: number
  created_at: string
  notes: string | null
  items: OrderItem[]
  customers: {
    name: string
    email: string | null
    phone: string | null
    address?: string | null
  } | null
}

interface Props {
  orders: OrderRow[]
  businessSlug: string
  currency: string
}

export function OrdersTable({ orders, businessSlug, currency }: Props) {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <ClipboardIcon className="w-7 h-7 text-gray-300" />
        </div>
        <p className="font-semibold text-gray-500">No orders yet</p>
        <p className="text-sm text-gray-400 mt-1">Orders from your store will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          businessSlug={businessSlug}
          currency={currency}
        />
      ))}
    </div>
  )
}

// ── Order Detail Modal ────────────────────────────────────────
export async function OrderDetailModal({ orderId, businessSlug, currency }: { orderId: string, businessSlug: string, currency: string }) {
  const supabase = await createClient()
  
  // Define order type from Supabase query
  type OrderDetail = {
    id: string
    status: string
    total_amount: number
    created_at: string
    notes: string | null
    customers: {
      name: string
      email: string | null
      phone: string | null
      address?: string | null
    } | null
    businesses: {
      name: string
      slug: string
      whatsapp_number?: string | null
      jazzcash_number?: string | null
      easypaisa_number?: string | null
      sadapay_number?: string | null
    } | null
    order_items: Array<{
      id: string
      quantity: number
      unit_price: number
      products: {
        name: string
      } | null
    }> | null
  }
  
  const { data: orderData } = await supabase
    .from('orders')
    .select(`
      *,
      customers(*),
      businesses(name, slug, whatsapp_number, jazzcash_number, easypaisa_number, sadapay_number)
    `)
    .eq('id', orderId)
    .single()

  const order = (orderData as unknown as OrderDetail) ?? null

  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => {}} />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Order Details</h3>
          <button onClick={() => {}} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Order info */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono font-bold text-sm text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
          </div>
          
          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Customer</p>
            {order.customers ? (
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{order.customers.name}</p>
                {order.customers.phone && <p className="text-sm text-gray-600">{order.customers.phone}</p>}
                {order.customers.email && <p className="text-sm text-gray-600">{order.customers.email}</p>}
                {order.customers.address && <p className="text-sm text-gray-600 mt-2">{order.customers.address}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No customer information</p>
            )}
          </div>
          
          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Items Ordered</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                <span className="font-semibold">Item</span>
                <span className="font-semibold">Qty</span>
                <span className="font-semibold">Price</span>
              </div>
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.products?.name || 'Unknown product'}</span>
                    <span className="text-gray-600">x{item.quantity}</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(item.unit_price * item.quantity, currency)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No items found</p>
              )}
            </div>
          </div>
          
          {/* Totals */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-500">Total Amount</span>
            <span className="text-xl font-bold text-indigo-600">{formatCurrency(order.total_amount, currency)}</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button onClick={() => {}} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, businessSlug, currency }: {
  order: OrderRow
  businessSlug: string
  currency: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Order header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Order number */}
          <span className="font-mono font-bold text-sm text-gray-900 tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>

          {/* Status updater */}
          <StatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            businessSlug={businessSlug}
          />

          {/* Date */}
          <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Total */}
          <span className="font-bold text-gray-900 text-base">
            {formatCurrency(Number(order.total_amount), currency)}
          </span>

          {/* View detail link */}
          <Link
            href={`/${businessSlug}/orders/${order.id}`}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold border border-indigo-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>

      {/* Body: customer + items side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* Customer info */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Customer</p>
          {order.customers ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-700 font-bold text-xs">
                    {order.customers.name[0].toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{order.customers.name}</p>
              </div>
              {order.customers.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <PhoneIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {order.customers.phone}
                </div>
              )}
              {order.customers.email && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MailIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {order.customers.email}
                </div>
              )}
              {order.customers.address && (
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <MapIcon className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{order.customers.address}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No customer info</p>
          )}
        </div>

        {/* Order items */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
            Items ({order.items.length})
          </p>
          {order.items.length > 0 ? (
            <ul className="space-y-1.5">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {item.quantity}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 shrink-0">
                    {formatCurrency(item.unit_price * item.quantity, currency)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">No items found</p>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium mb-1">Note:</p>
              <p className="text-xs text-gray-600 italic">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
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
