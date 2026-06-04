'use server'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getLast7DaysRevenue(orders: any[]): Array<{ date: string; revenue: number }> {
  const revenue: Record<string, number> = {}

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    revenue[dateStr] = 0
  }

  // Sum delivered orders
  orders.forEach((order: any) => {
    if (order.status === 'delivered') {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0]
      if (dateStr in revenue) {
        revenue[dateStr] += Number(order.total_amount)
      }
    }
  })

  return Object.entries(revenue).map(([date, amount]) => ({
    date,
    revenue: amount,
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessSlug = searchParams.get('slug')

    if (!businessSlug) {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', businessSlug)
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Fetch all stats in parallel
    const [
      { count: productCount },
      { count: activeProductCount },
      { count: orderCount },
      { count: customerCount },
      { data: allOrders },
      { data: topItemsRaw },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('is_active', true),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
      supabase.from('orders').select('id, status, total_amount, created_at').eq('business_id', business.id),
      supabase
        .from('order_items')
        .select('product_id, quantity, products(name)')
        .in('order_id', (allOrders ?? []).map((o: any) => o.id).slice(0, 200)),
    ])

    const orders = allOrders ?? []

    // Calculate stats
    const totalRevenue = orders.reduce((s, o: any) => s + Number(o.total_amount), 0)
    const deliveredRevenue = orders
      .filter((o: any) => o.status === 'delivered')
      .reduce((s, o: any) => s + Number(o.total_amount), 0)
    const pendingRevenue = orders
      .filter((o: any) => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status))
      .reduce((s, o: any) => s + Number(o.total_amount), 0)

    // Status breakdown
    const statusCounts = orders.reduce((acc: any, o: any) => {
      acc[o.status as keyof typeof acc] = (acc[o.status as keyof typeof acc] || 0) + 1
      return acc
    }, {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    })

    // Top products
    type TopItem = { product_id: string; quantity: number; products: { name: string } | null }
    const topProducts = (topItemsRaw as TopItem[] | null || [])
      .reduce((acc: Map<string, { name: string; quantity: number }>, item) => {
        if (item.products) {
          const existing = acc.get(item.product_id)
          acc.set(item.product_id, {
            name: item.products.name,
            quantity: (existing?.quantity || 0) + item.quantity,
          })
        }
        return acc
      }, new Map())
      .values()
    // @ts-ignore
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    const last7Days = getLast7DaysRevenue(orders)

    return NextResponse.json({
      productCount: productCount || 0,
      activeProductCount: activeProductCount || 0,
      orderCount: orderCount || 0,
      customerCount: customerCount || 0,
      totalRevenue,
      deliveredRevenue,
      pendingRevenue,
      topProducts: Array.from(topProducts),
      last7DaysRevenue: last7Days,
      statusCounts,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
