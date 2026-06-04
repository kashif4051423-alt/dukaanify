import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/utils/auth'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PaymentRequestsTable } from '@/components/admin/PaymentRequestsTable'
import { getAllPaymentRequests } from '@/lib/actions/payment'

export const metadata: Metadata = { title: 'Payment Requests — Dukaanify Admin' }

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Admin-only access: redirect non-admins to dashboard
  if (!user || !isAdmin(user.email)) redirect('/dashboard')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: paymentRequests },
    { data: allProfiles },
  ] = await Promise.all([
    service.from('payment_requests').select('*').order('created_at', { ascending: false }),
    service.from('profiles').select('id, email, full_name'),
  ])

  const profileMap = new Map((allProfiles ?? []).map((p) => [p.id, p]))

  const stats = {
    total: paymentRequests?.length ?? 0,
    pending: paymentRequests?.filter((p) => p.status === 'pending').length ?? 0,
    approved: paymentRequests?.filter((p) => p.status === 'approved').length ?? 0,
    rejected: paymentRequests?.filter((p) => p.status === 'rejected').length ?? 0,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">Dukaanify</p>
              <p className="text-slate-400 text-xs">Admin Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Overview</p>
          <SideNavItem href="/admin" icon={<GridIcon />} label="Dashboard" />
          <SideNavItem href="/admin/payments" icon={<CreditCardIcon />} label="Payments" active />
        </nav>

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
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="font-bold text-white">Payment Requests</h1>
            <p className="text-slate-400 text-xs">Manage plan upgrade payments</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Total Requests" value={stats.total} accent="slate" />
              <StatCard label="Pending" value={stats.pending} accent="yellow" />
              <StatCard label="Approved" value={stats.approved} accent="emerald" />
              <StatCard label="Rejected" value={stats.rejected} accent="red" />
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <PaymentRequestsTable
                requests={paymentRequests ?? []}
                profileMap={profileMap}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'slate' | 'yellow' | 'emerald' | 'red'
}) {
  const colors = {
    slate: 'bg-slate-800 text-slate-300',
    yellow: 'bg-yellow-900/30 text-yellow-300',
    emerald: 'bg-emerald-900/30 text-emerald-300',
    red: 'bg-red-900/30 text-red-300',
  }

  return (
    <div className={`${colors[accent]} rounded-lg p-4`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}

function SideNavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="w-4 h-4">{icon}</div>
      {label}
    </Link>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25C3.504 16.5 3 15.996 3 15.375v-2.25zM9.75 12c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-2.25c0-.621-.504-1.125-1.125-1.125h-2.25zM15.75 12c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-2.25c0-.621-.504-1.125-1.125-1.125h-2.25zM3 19.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125v-2.25z" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0-8.25h.008v.008h-.008v-.008zm2.25 0h.008v.008h-.008v-.008zm2.25 0h.008v.008h-.008v-.008zm6-2.25c0-1.657-1.343-3-3-3s-3 1.343-3 3m15.75 6.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}
