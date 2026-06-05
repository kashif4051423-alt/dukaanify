import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { OrderStatus } from '@/types/models'

export default async function CustomerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login if not authenticated
    return <div className="min-h-screen flex items-center justify-center"><p>Please log in to view your orders.</p></div>
  }

  // Define order type with proper Supabase response structure
  type OrderWithBusiness = {
    id: string
    status: string
    total_amount: number
    payment_method: string
    notes: string | null
    created_at: string
    businesses: {
      id: string
      name: string
      slug: string
      logo_url: string | null
    }
  }

  // Get customer's orders with business info
  const { data: ordersData, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      payment_method,
      notes,
      created_at,
      businesses(
        id,
        name,
        slug,
        logo_url
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  // Cast to proper type
  const orders = (ordersData as unknown as OrderWithBusiness[]) ?? []

  if (error) {
    console.error('Error fetching customer orders:', error)
    return <div className="p-6 text-center text-red-500">Failed to load orders. Please try again.</div>
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
        </div>
      </div>
    )
  }

  // Group orders by business
  const ordersByBusiness = orders.reduce((acc, order) => {
    const business = order.businesses
    if (business) {
      if (!acc[business.id]) {
        acc[business.id] = {
          business,
          orders: [],
        }
      }
      acc[business.id].orders.push(order)
    }
    return acc
  }, {} as Record<string, { business: OrderWithBusiness['businesses']; orders: OrderWithBusiness[] }>)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

        {Object.entries(ordersByBusiness).map(([businessId, { business, orders: businessOrders }]) => (
          <div key={businessId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Business Header */}
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-3">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {business.name[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-bold text-gray-900">{business.name}</h2>
                <p className="text-xs text-gray-500">{businessOrders.length} order{businessOrders.length !== 1 && 's'}</p>
              </div>
            </div>

            {/* Orders List */}
            <div className="divide-y divide-gray-100">
              {businessOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: { id: string; status: string; total_amount: number; payment_method: string; notes: string | null; created_at: string } }) {
  const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-100' },
    processing: { label: 'Processing', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    shipped: { label: 'Shipped', color: 'text-purple-600', bg: 'bg-purple-100' },
    delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' },
  }

  const status = statusConfig[order.status as OrderStatus] || statusConfig.pending

  return (
    <div className="p-5 hover:bg-gray-50 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-sm text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>
        <span className="font-bold text-gray-900">
          {formatCurrency(Number(order.total_amount), 'PKR')}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(order.created_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Note:</p>
          <p className="text-sm text-gray-600 italic">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
