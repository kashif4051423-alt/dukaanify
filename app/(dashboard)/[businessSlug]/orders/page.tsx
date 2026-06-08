// fixed
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { formatCurrency } from '@/lib/utils/format'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ businessSlug: string }>
  searchParams: Promise<{ status?: string }>
}

export const metadata: Metadata = { title: 'Orders — Dukaanify' }

export default async function OrdersPage({ params, searchParams }: Props) {
  const { businessSlug } = await params
  const { status: statusFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, currency')
    .eq('slug', businessSlug)
    .eq('owner_id', user!.id)
    .single()

  if (!business) notFound()

  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('orders')
    .select(`
      id, 
      status, 
      total_amount, 
      created_at, 
      notes,
      customers(name, email, phone, address),
      order_items(quantity, unit_price, products(name))
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: ordersRaw }: any = await query

  const orders = (ordersRaw ?? []).map((o: any) => ({
    id: o.id,
    status: o.status,
    total_amount: o.total_amount,
    created_at: o.created_at,
    notes: o.notes,
    customers: o.customers,
    items: (o.order_items ?? []).map((item: any) => ({
      name: item.products?.name ?? 'Unknown product',
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
    })),
  }))

  const todayOrders: any[] = orders.filter((o: any) => o.created_at.startsWith(today))
  const olderOrders: any[] = orders.filter((o: any) => !o.created_at.startsWith(today))

  const { data: allOrders }: { data: any[] | null } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .eq('business_id', business.id)

  const stats = computeStats(allOrders ?? [], business.currency)

  const todayDateFilter: any[] = (allOrders ?? []).filter((o: any) => o.created_at.startsWith(today))
  const todayStats = computeStats(todayDateFilter, business.currency)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders</p>
      </div>

      {todayOrders.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-6">
          <div className="col-span-2 lg:col-span-4">
            <h2 className="text-sm font-bold text-indigo-900 mb-3">Today's Performance</h2>
          </div>
          {todayStats.map((s: any) => (
            <div key={'today-' + s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <p className="text-xs text-indigo-500 font-medium">{s.label}</p>
              </div>
              <p className={`text-2xl font-bold ${s.color ?? 'text-gray-900'}`}>{s.value}</p>
              {s.sub && <p className="text-xs text-indigo-400 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s: any) => (
          <div key={s.label} className={`bg-white border rounded-2xl px-5 py-4 ${s.accent ?? 'border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color ?? 'text-gray-900'}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <Suspense fallback={<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}>
          <OrderFilters total={allOrders?.length ?? 0} />
        </Suspense>
      </div>

      {todayOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Orders ({todayOrders.length})</h2>
          <OrdersTable
            orders={todayOrders as any}
            businessSlug={businessSlug}
            currency={business.currency ?? 'PKR'}
          />
        </div>
      )}

      {olderOrders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Older Orders ({olderOrders.length})</h2>
          <OrdersTable
            orders={olderOrders as any}
            businessSlug={businessSlug}
            currency={business.currency ?? 'PKR'}
          />
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  )
}

function computeStats(orders: any[], currency: string) {
  const total = orders.length
  const revenue = orders
    .filter((o: any) => o.status === 'delivered')
    .reduce((s: any, o: any) => s + Number(o.total_amount), 0)
  const pending = orders.filter((o: any) => o.status === 'pending').length
  const active = orders.filter(
    (o: any) => ['confirmed', 'processing', 'shipped'].includes(o.status)
  ).length

  return [
    { label: 'Total Orders', value: total, sub: 'All time', dot: 'bg-gray-400', color: 'text-gray-900' },
    { label: 'Revenue', value: formatCurrency(revenue, currency), sub: 'Delivered only', dot: 'bg-emerald-500', color: 'text-emerald-600', accent: 'border-emerald-100' },
    { label: 'Pending', value: pending, sub: 'Need attention', dot: 'bg-yellow-400', color: 'text-yellow-600', accent: 'border-yellow-100' },
    { label: 'In Progress', value: active, sub: 'Being processed', dot: 'bg-indigo-400', color: 'text-indigo-600', accent: 'border-indigo-100' },
  ]
}
