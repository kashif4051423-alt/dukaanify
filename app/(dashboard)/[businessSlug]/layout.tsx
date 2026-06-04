import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BusinessNav } from '@/components/dashboard/BusinessNav'
import type { Metadata } from 'next'

interface Props {
  children: React.ReactNode
  params: Promise<{ businessSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('slug', businessSlug)
    .single()
  return { title: business ? `${business.name} — Dukaanify` : 'Dukaanify' }
}

export default async function BusinessLayout({ children, params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Require authentication
  if (!user) redirect('/login')

  // Verify business exists AND user owns it (multi-tenant safety)
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .eq('owner_id', user.id)
    .single()

  // If business doesn't exist or user doesn't own it, return 404
  if (!business) notFound()

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {/* BusinessNav renders: fixed sidebar (w-64) + fixed topbar (h-14) */}
      <BusinessNav business={business} />

      {/* Content: offset for fixed topbar (pt-14) and sidebar on desktop (lg:pl-64) */}
      <div className="pt-14 lg:pl-64 min-h-screen">
        <main className="min-h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
