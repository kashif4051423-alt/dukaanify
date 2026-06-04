import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { OrderStatusChart } from '@/components/analytics/OrderStatusChart'

interface Props {
  params: Promise<{ businessSlug: string }>
}

export default async function BusinessOverviewPage({ params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is authenticated
  if (!user) {
    return notFound()
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .eq('owner_id', user.id)
    .single()

  if (!business) notFound()

  const currency = business.currency ?? 'PKR'

  // ── All stats in parallel ─────────────────────────────────
  const [
    { count: productCount },
    { count: activeProductCount },
    { count: orderCount },
    { count: customerCount },
    { data: allOrders },
    { data: recentOrdersRaw },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('is_active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('orders').select('id, status, total_amount, created_at').eq('business_id', business.id).order('created_at', { ascending: false }),
    supabase.from('orders').select('id, status, total_amount, created_at, customers(name, phone)').eq('business_id', business.id).order('created_at', { ascending: false }).limit(6),
  ])

  // ── Revenue calculations (optimized) ──────────────────────
  const orders = allOrders ?? []
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0)
  const deliveredRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0)
  const pendingRevenue = orders.filter((o) => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).reduce((s, o) => s + Number(o.total_amount), 0)

  // ── Status breakdown (single pass) ───────────────────────
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status as keyof typeof acc] = (acc[o.status as keyof typeof acc] || 0) + 1
    return acc
  }, {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  })

  // ── Last 7 days revenue (for bar chart) ───────────────────
  const last7 = getLast7DaysRevenue(orders)

  // ── Top products by order count ───────────────────────────
  // Fetch order items to find top products
  const { data: topItemsRaw } = await supabase
    .from('order_items')
    .select('product_id, quantity, products(name)')
    .in('order_id', orders.map((o) => o.id).slice(0, 200)) // cap for performance

  type TopItem = { product_id: string; quantity: number; products: { name: string } | null }
  const topProducts = computeTopProducts((topItemsRaw as unknown as TopItem[]) ?? [])

  const recentOrders = (recentOrdersRaw ?? []) as Array<{
    id: string
    status: string
    total_amount: number
    created_at: string
    customers: { name: string; phone: string | null } | null
  }>

  const statusColors: Record<string, string> = {
    pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipped:    'bg-purple-50 text-purple-700 border-purple-200',
    delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled:  'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* ── Business header ─────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200">
          {business.logo_url ? (
            <Image src={business.logo_url} alt={business.name} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {business.name[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">/{business.slug} · Since {formatDate(business.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/store/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors font-medium"
          >
            View Store ↗
          </a>
          <Link
            href={`/${businessSlug}/settings`}
            className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* ── KPI stat cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue, currency)}
          sub={`${formatCurrency(deliveredRevenue, currency)} delivered`}
          icon={<RevenueIcon />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          valueColor="text-emerald-700"
        />
        <Link href={`/${businessSlug}/orders`} className="block">
          <StatCard
            label="Total Orders"
            value={orderCount ?? 0}
            sub={`${statusCounts.pending} pending`}
            icon={<OrderIcon />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            valueColor="text-blue-700"
            clickable
          />
        </Link>
        <Link href={`/${businessSlug}/products`} className="block">
          <StatCard
            label="Products"
            value={productCount ?? 0}
            sub={`${activeProductCount ?? 0} active`}
            icon={<ProductIcon />}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            valueColor="text-indigo-700"
            clickable
          />
        </Link>
        <Link href={`/${businessSlug}/customers`} className="block">
          <StatCard
            label="Customers"
            value={customerCount ?? 0}
            sub="Unique buyers"
            icon={<CustomerIcon />}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            valueColor="text-violet-700"
            clickable
          />
        </Link>
      </div>

      {/* ── Revenue + Status charts ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue bar chart — 2 cols */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue (Last 7 Days)</h2>
              <p className="text-xs text-gray-400 mt-0.5">Daily order totals</p>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {formatCurrency(last7.reduce((s, d) => s + d.revenue, 0), currency)}
            </span>
          </div>
          <RevenueChart data={last7} currency={currency} />
        </div>

        {/* Order status donut — 1 col */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">Order Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">All time breakdown</p>
          </div>
          <OrderStatusChart counts={statusCounts} total={orderCount ?? 0} />
        </div>
      </div>

      {/* ── Revenue summary + Top products ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-3">
            <RevenueRow label="Total (all orders)" value={formatCurrency(totalRevenue, currency)} color="bg-gray-200" pct={100} />
            <RevenueRow label="Delivered (earned)" value={formatCurrency(deliveredRevenue, currency)} color="bg-emerald-500" pct={totalRevenue > 0 ? (deliveredRevenue / totalRevenue) * 100 : 0} />
            <RevenueRow label="In pipeline" value={formatCurrency(pendingRevenue, currency)} color="bg-indigo-400" pct={totalRevenue > 0 ? (pendingRevenue / totalRevenue) * 100 : 0} />
            <RevenueRow label="Cancelled" value={formatCurrency(orders.filter((o) => o.status === 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0), currency)} color="bg-red-300" pct={totalRevenue > 0 ? (orders.filter((o) => o.status === 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0) / totalRevenue) * 100 : 0} />
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top Products</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 shrink-0">{p.qty} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No sales data yet</p>
          )}
        </div>
      </div>

      {/* ── Recent orders ────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href={`/${businessSlug}/orders`} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/${businessSlug}/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-500">
                      {(order.customers?.name?.[0] ?? '#').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.customers?.name ?? 'Guest'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(Number(order.total_amount), currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">No orders yet. Share your store link to start receiving orders.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────

function getLast7DaysRevenue(orders: Array<{ created_at: string; total_amount: number; status: string }>) {
  const days: Array<{ label: string; date: string; revenue: number; count: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === dateStr)
    days.push({
      label,
      date: dateStr,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total_amount), 0),
      count: dayOrders.length,
    })
  }
  return days
}

function computeTopProducts(items: Array<{ product_id: string; quantity: number; products: { name: string } | null }>) {
  const map: Record<string, { name: string; qty: number }> = {}
  for (const item of items) {
    const name = item.products?.name ?? 'Unknown'
    if (!map[item.product_id]) map[item.product_id] = { name, qty: 0 }
    map[item.product_id].qty += item.quantity
  }
  return Object.values(map).sort((a, b) => b.qty - a.qty)
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({ label, value, sub, icon, iconBg, iconColor, valueColor, clickable }: {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; iconBg: string; iconColor: string; valueColor: string
  clickable?: boolean
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-5 h-full ${clickable ? 'hover:border-indigo-200 hover:shadow-sm transition-all' : ''}`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm text-gray-600 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function RevenueRow({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

// Icons
function RevenueIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function OrderIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
}
function ProductIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
}
function CustomerIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}
