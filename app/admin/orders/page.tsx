import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/utils/auth'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Orders — Admin — Dukaanify' }

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !isAdmin(user.email)) redirect('/dashboard')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: allOrders },
    { data: allBusinesses },
    { data: allProfiles },
  ] = await Promise.all([
    service.from('orders').select('*, business_id').order('created_at', { ascending: false }),
    service.from('businesses').select('id, name, slug, owner_id, currency'),
    service.from('profiles').select('id, email, full_name'),
  ])

  const businessMap = new Map((allBusinesses ?? []).map((b) => [b.id, b]))
  const profileMap = new Map((allProfiles ?? []).map((p) => [p.id, p]))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
      case 'processing': return 'bg-blue-900/30 text-blue-400 border-blue-500/30'
      case 'shipped': return 'bg-purple-900/30 text-purple-400 border-purple-500/30'
      case 'delivered': return 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
      case 'cancelled': return 'bg-red-900/30 text-red-400 border-red-500/30'
      default: return 'bg-slate-700 text-slate-300 border-slate-600'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.svg"
              alt="Dukaanify"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div>
              <p className="font-bold text-white text-sm">Dukaanify</p>
              <p className="text-slate-400 text-xs">Admin Console</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Overview</p>
          <SideNavItem href="/admin" icon={<GridIcon />} label="Dashboard" />
          <SideNavItem href="/admin/payments" icon={<CreditCardIcon />} label="Payments" />
          <SideNavItem href="/admin/clients" icon={<UsersIcon />} label="Clients" />
          <SideNavItem href="/admin/businesses" icon={<StoreIcon />} label="Businesses" />
          <SideNavItem href="/admin/orders" icon={<OrderIcon />} label="Orders" active />
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0" style={{ height: '56px' }}>
          <div>
            <h1 className="font-bold text-white" style={{ fontSize: '15px', margin: 0, lineHeight: 1.4 }}>All Orders</h1>
            <p className="text-slate-400" style={{ fontSize: '11px', margin: 0 }}>Orders from all businesses</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400" style={{ fontSize: '11px' }}>Live</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {/* Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {(allOrders ?? []).length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <Th>Order ID</Th>
                      <Th>Business</Th>
                      <Th>Owner</Th>
                      <Th>Items</Th>
                      <Th>Total Amount</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {(allOrders ?? []).map((order: any) => {
                      const business = businessMap.get(order.business_id)
                      const owner = business ? profileMap.get(business.owner_id) : null
                      const initials = (owner?.full_name ?? owner?.email ?? '?')[0].toUpperCase()
                      
                      return (
                        <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group">
                          <td className="px-5 py-3.5">
                            <span className="font-mono text-xs text-indigo-400">{order.id.slice(0, 8)}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                                <span className="text-violet-400 font-bold text-xs">{business?.name[0].toUpperCase()}</span>
                              </div>
                              <span className="font-medium text-white">{business?.name ?? 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                <span className="text-indigo-400 font-bold text-xs">{initials}</span>
                              </div>
                              <span className="text-slate-400 text-xs">{owner?.full_name ?? owner?.email ?? 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-white">{order.items_count ?? 0}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-emerald-400">
                              {formatCurrency(order.total_amount, businessMap.get(order.business_id)?.currency ?? 'PKR')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(order.created_at)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {children}
    </th>
  )
}

function SideNavItem({ href, icon, label, active }: {
  href: string; icon: React.ReactNode; label: string; active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-indigo-600 text-white font-semibold'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-500'}>{icon}</span>
      {label}
    </Link>
  )
}

// Icons
function GridIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
}
function UsersIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}
function StoreIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
}
function OrderIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
}
function CreditCardIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0-8.25h.008v.008h-.008v-.008zm2.25 0h.008v.008h-.008v-.008zm2.25 0h.008v.008h-.008v-.008zm6-2.25c0-1.657-1.343-3-3-3s-3 1.343-3 3m15.75 6.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
}
