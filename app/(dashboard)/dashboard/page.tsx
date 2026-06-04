import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessCard } from '@/components/dashboard/BusinessCard'
import { isAdmin } from '@/lib/utils/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = isAdmin(user.email)

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const count = businesses?.length ?? 0
  // Non-admins can only have 1 business
  const canAddMore = admin || count === 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Admin banner */}
      {admin && (
        <div className="flex items-center justify-between bg-[#7c3aed] text-white rounded-2xl px-5 py-3.5 mb-6">
          <div className="flex items-center gap-2.5">
            <ShieldIcon className="w-5 h-5 text-purple-200" />
            <span className="text-sm font-semibold">Admin Mode — Unlimited businesses</span>
          </div>
          <Link
            href="/admin"
            className="text-xs bg-white text-[#7c3aed] font-bold px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Admin Panel →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#f9fafb]">Your Businesses</h1>
          <p className="text-sm text-[#9ca3af] mt-1">
            {count === 0
              ? 'Create your first store to get started'
              : `${count} business${count !== 1 ? 'es' : ''} in your account`}
          </p>
        </div>
        {canAddMore && (
          <Link
            href="/dashboard/new-business"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7c3aed] text-white rounded-lg text-sm font-semibold hover:bg-[#6d28d9] transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            New Business
          </Link>
        )}
      </div>

      {/* Business grid */}
      {count > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {businesses!.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}

          {/* Add new card — only for admin or if under limit */}
          {canAddMore && (
            <Link
              href="/dashboard/new-business"
              className="flex flex-col items-center justify-center gap-3 bg-[#111827] border-2 border-dashed border-[#1f2937] rounded-2xl p-5 hover:border-[#7c3aed]/50 hover:bg-purple-900/10 transition-all duration-200 min-h-[160px] group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-900/50 transition-colors">
                <PlusIcon className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <p className="text-sm font-medium text-[#9ca3af] group-hover:text-[#7c3aed] transition-colors">
                Add another business
              </p>
            </Link>
          )}

          {/* Limit reached message for non-admins */}
          {!canAddMore && (
            <div className="flex flex-col items-center justify-center gap-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 min-h-[160px]">
              <LockIcon className="w-8 h-8 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">1 business limit</p>
                <p className="text-xs text-gray-400 mt-1">Contact admin to add more</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
        <StoreIcon className="w-8 h-8 text-indigo-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">No businesses yet</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Create your first store to start managing products, orders, and customers.
      </p>
      <Link
        href="/dashboard/new-business"
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Create your first business
      </Link>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
}
function StoreIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
}
function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
}
function LockIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
}
