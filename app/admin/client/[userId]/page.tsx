import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect, notFound } from 'next/navigation'
import { isAdmin } from '@/lib/utils/auth'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ userId: string }>
}

export const metadata: Metadata = { title: 'Client Detail — Admin' }

export default async function ClientDetailPage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()

  // Admin-only access: redirect non-admins to dashboard
  if (!adminUser || !isAdmin(adminUser.email)) redirect('/dashboard')

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── Fetch client profile ──────────────────────────────────
  const { data: profile } = await service
    .from('profiles')
    .select('id, email, full_name, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (!profile) notFound()

  // ── Fetch client's businesses ─────────────────────────────
  const { data: businesses } = await service
    .from('businesses')
    .select('id, name, slug, currency, is_active, created_at, description, whatsapp_number')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  // ── Fetch all orders for this client's businesses ─────────
  const bizIds = (businesses ?? []).map((b) => b.id)
  const { data: allOrders } = bizIds.length > 0
    ? await service
        .from('orders')
        .select('id, business_id, status, total_amount, payment_method, created_at')
        .in('business_id', bizIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // ── Fetch products per business ───────────────────────────
  const { data: allProducts } = bizIds.length > 0
    ? await service
        .from('products')
        .select('id, name, price, is_active, business_id, image_url')
        .in('business_id', bizIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // ── Fetch auth user details (for password reset link) ─────
  const { data: authData } = await service.auth.admin.getUserById(userId)
  const authUser = authData?.user

  // ── Compute stats ─────────────────────────────────────────
  const totalOrders = allOrders?.length ?? 0
  const totalRevenue = (allOrders ?? [])
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + Number(o.total_amount), 0)
  const totalProducts = allProducts?.length ?? 0

  const ordersByBiz = new Map<string, number>()
  for (const o of allOrders ?? []) {
    ordersByBiz.set(o.business_id, (ordersByBiz.get(o.business_id) ?? 0) + 1)
  }

  const productsByBiz = new Map<string, typeof allProducts>()
  for (const p of allProducts ?? []) {
    if (!p) continue
    const existing = productsByBiz.get(p.business_id) ?? []
    existing.push(p)
    productsByBiz.set(p.business_id, existing)
  }

  const initials = (profile.full_name ?? profile.email ?? '?')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-indigo-300 hover:text-white transition-colors text-sm">
            ← Admin Panel
          </Link>
          <span className="text-indigo-400">/</span>
          <span className="font-semibold">Client Detail</span>
        </div>
        <Link href="/dashboard" className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg">
          Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Client profile card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">{initials}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.full_name ?? 'No name set'}
              </h1>
              <p className="text-gray-500 mt-0.5">{profile.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Joined {formatDate(profile.created_at)} · User ID: {userId.slice(0, 8)}...
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                <MailIcon className="w-3.5 h-3.5" />
                Send Email
              </a>
              <a
                href={`https://supabase.com/dashboard/project/iprvwdsniwmspdmewzbs/auth/users`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                <KeyIcon className="w-3.5 h-3.5" />
                Reset Password
              </a>
            </div>
          </div>

          {/* Auth details */}
          <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoBox label="Email" value={profile.email} />
            <InfoBox label="Full Name" value={profile.full_name ?? '—'} />
            <InfoBox label="Last Sign In" value={authUser?.last_sign_in_at ? formatDate(authUser.last_sign_in_at) : '—'} />
            <InfoBox label="Auth Provider" value={authUser?.app_metadata?.provider ?? 'email'} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-indigo-600">{businesses?.length ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Businesses</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
            <p className="text-sm text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">{totalProducts}</p>
            <p className="text-sm text-gray-500 mt-1">Products</p>
          </div>
        </div>

        {/* Businesses */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            🏪 Businesses ({businesses?.length ?? 0})
          </h2>
          <div className="space-y-4">
            {(businesses ?? []).map((biz) => {
              const bizOrders = ordersByBiz.get(biz.id) ?? 0
              const bizProducts = productsByBiz.get(biz.id) ?? []
              return (
                <div key={biz.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  {/* Business header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-700 font-bold">{biz.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{biz.name}</p>
                        <p className="text-xs text-gray-400">/{biz.slug} · {biz.currency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        biz.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {biz.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <a
                        href={`/store/${biz.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold border border-indigo-200 px-3 py-1 rounded-lg"
                      >
                        View Store ↗
                      </a>
                    </div>
                  </div>

                  {/* Business details */}
                  <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm border-b border-gray-100">
                    <InfoBox label="Created" value={formatDate(biz.created_at)} />
                    <InfoBox label="Orders" value={String(bizOrders)} />
                    <InfoBox label="Products" value={String(bizProducts.length)} />
                    <InfoBox label="WhatsApp" value={biz.whatsapp_number ?? '—'} />
                  </div>

                  {/* Products list */}
                  {bizProducts.length > 0 && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Products ({bizProducts.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {bizProducts.slice(0, 8).map((p) => p && (
                          <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${p.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{formatCurrency(Number(p.price), biz.currency)}</p>
                            </div>
                          </div>
                        ))}
                        {bizProducts.length > 8 && (
                          <div className="flex items-center justify-center bg-gray-50 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-400">+{bizProducts.length - 8} more</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Recent orders */}
        {(allOrders ?? []).length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              📦 Recent Orders ({totalOrders})
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Business</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(allOrders ?? []).slice(0, 20).map((order) => {
                      const biz = (businesses ?? []).find((b) => b.id === order.business_id)
                      return (
                        <tr key={order.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3 font-mono text-xs font-bold text-gray-700">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-5 py-3 text-gray-600 text-xs">{biz?.name ?? '—'}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'pending' ? 'bg-yellow-50 text-yellow-700'
                              : order.status === 'cancelled' ? 'bg-red-50 text-red-700'
                              : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500 capitalize">
                            {order.payment_method ?? 'cod'}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-gray-900">
                            {formatCurrency(Number(order.total_amount), biz?.currency ?? 'PKR')}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-400">{formatDate(order.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-all">{value}</p>
    </div>
  )
}

function MailIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
}
function KeyIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
}
