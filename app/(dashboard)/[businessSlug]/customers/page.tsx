import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ businessSlug: string }>
}

export default async function CustomersPage({ params }: Props) {
  const { businessSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, owner_id')
    .eq('slug', businessSlug)
    .single()

  if (!business || business.owner_id !== user.id) notFound()

  // Get customers with order count
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone, address, created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  // Get order counts per customer
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('customer_id, count')
    .eq('business_id', business.id)
    .groupBy('customer_id')

  const orderCountMap: Record<string, number> = {}
  orderCounts?.forEach((oc: any) => {
    orderCountMap[oc.customer_id] = oc.count || 0
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
        <p className="text-gray-600">Manage all your customers in one place</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {customers && customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(customer.name?.[0] ?? '#').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name || 'Unnamed'}</p>
                          <p className="text-xs text-gray-500">{customer.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.email && (
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-sm text-indigo-600 hover:underline block"
                          >
                            {customer.email}
                          </a>
                        )}
                        {customer.phone && (
                          <a
                            href={`tel:${customer.phone}`}
                            className="text-sm text-gray-700 hover:text-indigo-600 block"
                          >
                            {customer.phone}
                          </a>
                        )}
                        {!customer.email && !customer.phone && (
                          <p className="text-sm text-gray-400">—</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {customer.address || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm">
                        {orderCountMap[customer.id] || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M13 20H3v-2a6 6 0 0112 0v2zm0-12a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No customers yet</p>
            <p className="text-gray-400 text-sm mt-1">Your customers will appear here after their first order</p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {customers && customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600 font-medium">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600 font-medium">With Contact</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {customers.filter((c: any) => c.email || c.phone).length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600 font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {Object.values(orderCountMap).reduce((a: number, b: number) => a + b, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
