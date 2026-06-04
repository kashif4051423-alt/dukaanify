'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/format'
import { redirect } from 'next/navigation'

interface UserPlan {
  id: string
  user_id: string
  plan_name: string
  max_businesses: number
  payment_status: 'pending' | 'approved' | 'rejected' | 'active'
  payment_method: string | null
  transaction_id: string | null
  screenshot_url: string | null
  admin_notes: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  profile?: {
    email: string
    full_name: string | null
  }
}

const PLAN_TIERS = {
  free: { name: 'Free', businesses: 1, color: 'bg-gray-100 text-gray-700' },
  starter: { name: 'Starter', businesses: 3, color: 'bg-blue-100 text-blue-700' },
  pro: { name: 'Pro', businesses: 5, color: 'bg-purple-100 text-purple-700' },
  business: { name: 'Business', businesses: 10, color: 'bg-indigo-100 text-indigo-700' },
  enterprise: { name: 'Enterprise', businesses: 999, color: 'bg-green-100 text-green-700' },
}

const ADMIN_EMAIL = 'khanwal11992858@gmail.com'

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function UpgradedPlansPage() {
  const [userPlans, setUserPlans] = useState<UserPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null)
  const [editingPlan, setEditingPlan] = useState<UserPlan | null>(null)
  const [newPlanName, setNewPlanName] = useState('')
  const [newMaxBusinesses, setNewMaxBusinesses] = useState(1)
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected' | 'active'>('pending')
  const [adminNotes, setAdminNotes] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/dashboard')
      }
      
      setUserEmail(user.email)
      loadUserPlans()
    } catch (err) {
      redirect('/dashboard')
    }
  }

  async function loadUserPlans() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_plans')
        .select(`
          *,
          profile:user_id(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserPlans(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePlan() {
    if (!editingPlan) return

    try {
      const client = supabase as any
      const { error } = await client
        .from('user_plans')
        .update({
          plan_name: newPlanName,
          max_businesses: newMaxBusinesses,
          payment_status: newStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPlan.id)

      if (error) throw error

      await loadUserPlans()
      setEditingPlan(null)
      setSelectedPlan(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
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

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Management</p>
          <NavItem href="/admin" icon="📊" label="Dashboard" />
          <NavItem href="/admin/payments" icon="💳" label="Payments" />
          <NavItem href="/admin/upgraded-plans" icon="⭐" label="Upgraded Plans" active />
          <NavItem href="/admin/businesses" icon="🏪" label="Businesses" />
          <NavItem href="/admin/orders" icon="📦" label="Orders" />
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">⭐ Upgraded Plans</h1>
            <p className="text-slate-400">Manage user plans and business limits</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Users"
              value={userPlans.length}
              icon="👥"
            />
            <StatCard
              label="Approved"
              value={userPlans.filter((p) => p.payment_status === 'approved').length}
              icon="✅"
            />
            <StatCard
              label="Pending"
              value={userPlans.filter((p) => p.payment_status === 'pending').length}
              icon="⏳"
            />
            <StatCard
              label="Rejected"
              value={userPlans.filter((p) => p.payment_status === 'rejected').length}
              icon="❌"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">#</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Plan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Businesses</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Payment Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {userPlans.map((plan, index) => (
                    <tr key={plan.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-white">{plan.profile?.full_name || 'No Name'}</p>
                          <p className="text-xs text-slate-400">{plan.profile?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PLAN_TIERS[plan.plan_name as keyof typeof PLAN_TIERS]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {PLAN_TIERS[plan.plan_name as keyof typeof PLAN_TIERS]?.name || plan.plan_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-semibold text-indigo-400">{plan.max_businesses}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {plan.payment_method ? (
                          <span className="text-slate-300">{plan.payment_method}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${STATUS_COLORS[plan.payment_status]}`}>
                          {plan.payment_status === 'pending' && '⏳ Pending'}
                          {plan.payment_status === 'approved' && '✅ Approved'}
                          {plan.payment_status === 'rejected' && '❌ Rejected'}
                          {plan.payment_status === 'active' && '🟢 Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(plan.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setSelectedPlan(plan)
                            setEditingPlan(plan)
                            setNewPlanName(plan.plan_name)
                            setNewMaxBusinesses(plan.max_businesses)
                            setNewStatus(plan.payment_status)
                            setAdminNotes(plan.admin_notes || '')
                          }}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userPlans.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No users found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Edit Modal ── */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit User Plan</h2>

            <div className="space-y-4">
              {/* User Info */}
              <div className="p-3 bg-slate-800 rounded">
                <p className="text-sm text-slate-400">User</p>
                <p className="font-semibold">{editingPlan.profile?.full_name || 'No Name'}</p>
                <p className="text-xs text-slate-400">{editingPlan.profile?.email}</p>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Plan</label>
                <select
                  value={newPlanName}
                  onChange={(e) => {
                    setNewPlanName(e.target.value)
                    const businesses = PLAN_TIERS[e.target.value as keyof typeof PLAN_TIERS]?.businesses || 1
                    setNewMaxBusinesses(businesses)
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white cursor-pointer"
                >
                  {Object.entries(PLAN_TIERS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name} ({value.businesses} businesses)
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Businesses */}
              <div>
                <label className="block text-sm font-medium mb-2">Max Businesses</label>
                <input
                  type="number"
                  value={newMaxBusinesses}
                  onChange={(e) => setNewMaxBusinesses(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                  min="1"
                  max="999"
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white cursor-pointer"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                  <option value="active">🟢 Active</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                  rows={3}
                  placeholder="Add notes..."
                />
              </div>

              {/* Screenshot */}
              {editingPlan.screenshot_url && (
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Screenshot</label>
                  <a
                    href={editingPlan.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-sm cursor-pointer"
                  >
                    View Screenshot →
                  </a>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdatePlan}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-medium transition-colors cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingPlan(null)
                    setSelectedPlan(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
