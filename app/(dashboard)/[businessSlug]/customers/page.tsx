import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ businessSlug: string }>
}

export default async function CustomersPage({ params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', businessSlug)
    .single()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', business!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <pre className="text-xs text-gray-400">{JSON.stringify(customers, null, 2)}</pre>
    </div>
  )
}
