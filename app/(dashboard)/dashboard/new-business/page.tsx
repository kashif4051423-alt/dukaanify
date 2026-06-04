import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/utils/auth'
import { CreateBusinessForm } from '@/components/dashboard/CreateBusinessForm'
import { UpgradePlans } from '@/components/dashboard/UpgradePlans'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Business — Dukaanify' }

export default async function NewBusinessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = isAdmin(user.email)

  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  const atLimit = !admin && (count ?? 0) >= 1

  // Non-admin at limit → show upgrade/pricing UI
  if (atLimit) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
        <UpgradePlans />
      </div>
    )
  }

  // Admin or under limit → show create form
  return (
    <div className="p-6 max-w-xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create a Business</h1>
        <p className="text-sm text-gray-500 mt-1">Set up a new store under your account</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <CreateBusinessForm />
      </div>
    </div>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
}
