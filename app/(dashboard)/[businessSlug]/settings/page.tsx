import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditBusinessForm } from '@/components/dashboard/EditBusinessForm'
import { DeleteBusinessButton } from '@/components/dashboard/DeleteBusinessButton'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ businessSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params
  return { title: `Settings — ${businessSlug} — Dukaanify` }
}

export default async function SettingsPage({ params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .eq('owner_id', user!.id)
    .single()

  if (!business) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your business details</p>
      </div>

      {/* General settings */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-5">General</h2>
        <EditBusinessForm business={business} />
      </section>

      {/* Danger zone */}
      <section className="bg-white border border-red-200 rounded-2xl p-6">
        <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete this business and all its data. This action cannot be undone.
        </p>
        <DeleteBusinessButton businessId={business.id} businessName={business.name} />
      </section>
    </div>
  )
}
