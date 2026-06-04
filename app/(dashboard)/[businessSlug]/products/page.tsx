import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductsShell } from '@/components/products/ProductsShell'
import type { Metadata } from 'next'
import type { Product } from '@/types/models'

interface Props {
  params: Promise<{ businessSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params
  return { title: `Products — ${businessSlug} — Dukaanify` }
}

export default async function ProductsPage({ params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Ownership check — only the business owner can see this page
  const { data: business } = await supabase
    .from('businesses')
    .select('id, currency')
    .eq('slug', businessSlug)
    .eq('owner_id', user!.id)
    .single()

  if (!business) notFound()

  // Fetch all products for this business, newest first
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ProductsShell
        products={(products ?? []) as Product[]}
        businessId={business.id}
        businessSlug={businessSlug}
        currency={business.currency ?? 'PKR'}
      />
    </div>
  )
}
