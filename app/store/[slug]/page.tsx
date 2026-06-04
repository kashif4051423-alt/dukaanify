import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StorefrontShell } from '@/components/store/StorefrontShell'
import type { Metadata } from 'next'
import type { Business, Product } from '@/types/models'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, logo_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!business) return { title: 'Store not found' }

  return {
    title: `${business.name} — Shop Online`,
    description: business.description ?? `Shop at ${business.name}`,
    openGraph: {
      title: business.name,
      description: business.description ?? undefined,
      images: business.logo_url ? [business.logo_url] : [],
    },
  }
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch full business row — all columns
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!business) notFound()

  // Fetch active products for this business
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <StorefrontShell
        business={business as unknown as Business}
        products={(products ?? []) as unknown as Product[]}
      />
    </div>
  )
}
