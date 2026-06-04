'use server'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessSlug = searchParams.get('slug')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

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

    const offset = (page - 1) * pageSize

    // Build query
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)

    let dataQuery = supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        notes,
        customers(name, email, phone, address),
        order_items(quantity, unit_price, products(name))
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
      dataQuery = dataQuery.eq('status', status)
    }

    const { count } = await countQuery
    const { data: orders } = await dataQuery

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
