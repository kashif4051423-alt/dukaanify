'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendOrderToGoogleSheetWithRetry } from '@/lib/googleSheets'
import type { OrderStatus } from '@/types/models'

// ── Storefront: place order ───────────────────────────────────

export interface CheckoutPayload {
  businessId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes?: string
  paymentMethod?: 'cod' | 'jazzcash' | 'easypaisa' | 'sadapay'
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
  }>
}

export interface CheckoutResult {
  orderId?: string
  orderNumber?: string
  error?: string
}

export async function placeOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    const supabase = await createClient()

    // ── Basic validation ──────────────────────────────────────
    if (!payload.businessId) return { error: 'Store ID is missing. Cannot place order.' }
    if (!payload.items.length) return { error: 'Cart is empty.' }
    if (!payload.customerName.trim()) return { error: 'Name is required.' }
    if (!payload.customerPhone.trim()) return { error: 'Phone number is required.' }
    if (!payload.customerAddress.trim()) return { error: 'Delivery address is required.' }

    console.log('🔄 placeOrder: Starting with payload:', {
      businessId: payload.businessId,
      items: payload.items.length,
      customerPhone: payload.customerPhone,
    })

  // ── Step 1: Verify the store exists and is active ─────────
  // This also confirms the businessId is valid
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, is_active')
    .eq('id', payload.businessId)   // ← exact store match
    .single()

  if (!business) {
    return { error: `Store not found (ID: ${payload.businessId.slice(0, 8)}).` }
  }
  if (!business.is_active) {
    return { error: `${business.name} is not currently accepting orders.` }
  }

  // ── Step 2: Verify products belong to THIS store ──────────
  // Prevents cross-store product injection
  const productIds = payload.items.map((i) => i.productId)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, stock_quantity, is_active')
    .in('id', productIds)
    .eq('business_id', payload.businessId)  // ← must belong to this store

  if (!products || products.length !== productIds.length) {
    return { error: 'One or more products are no longer available.' }
  }

  for (const item of payload.items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product || !product.is_active) {
      return { error: `"${product?.name ?? 'A product'}" is no longer available.` }
    }
    if (product.stock_quantity < item.quantity) {
      return { error: `"${product.name}" only has ${product.stock_quantity} in stock.` }
    }
  }

  const totalAmount = payload.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  // ── Step 3: Create or update customer ────
  console.log('🔄 placeOrder: Upserting customer...')
  
  // First check if customer exists
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('business_id', payload.businessId)
    .eq('phone', payload.customerPhone.trim())
    .single()

  let customerId = existingCustomer?.id

  if (!customerId) {
    // Create new customer
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        business_id: payload.businessId,
        phone: payload.customerPhone.trim(),
        name: payload.customerName.trim(),
        email: payload.customerEmail.trim() || null,
        address: payload.customerAddress.trim(),
      })
      .select('id')
      .single()

    if (customerError) {
      console.error('❌ Customer insert error:', {
        code: customerError.code,
        message: customerError.message,
        details: customerError.details,
        hint: customerError.hint,
      })
      return { error: `Failed to save customer details: ${customerError.message}` }
    }

    if (!newCustomer) {
      console.error('❌ Customer insert returned empty result')
      return { error: 'Failed to retrieve customer details.' }
    }

    customerId = newCustomer.id
  } else {
    // Update existing customer
    await supabase
      .from('customers')
      .update({
        name: payload.customerName.trim(),
        email: payload.customerEmail.trim() || null,
        address: payload.customerAddress.trim(),
      })
      .eq('id', customerId)
  }

  console.log('✅ Customer created/updated:', customerId)

  // ── Step 4: Create the order — business_id is mandatory ─────
  console.log('🔄 placeOrder: Creating order...')
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      business_id:    payload.businessId,   // ← THIS store's ID (from checkout payload)
      customer_id:    customerId,
      status:         'pending',
      total_amount:   totalAmount,
      notes:          payload.notes?.trim() || null,
      payment_method: payload.paymentMethod ?? 'cod',
      customer_email: payload.customerEmail.trim() || null,
      customer_phone: payload.customerPhone.trim(),
      delivery_address: payload.customerAddress.trim(),
    })
    .select('id, business_id, customer_id')
    .single()

  if (orderError || !order) {
    console.error('❌ Order creation error:', {
      code: orderError?.code,
      message: orderError?.message,
      details: orderError?.details,
      hint: orderError?.hint,
    })
    return { error: `Failed to place order: ${orderError?.message ?? 'Unknown error'}` }
  }

  console.log('✅ Order created:', {
    orderId: order.id,
    businessId: order.business_id,
    customerId: order.customer_id
  })

  // ── Step 5: Insert order items ────────────────────────────
  console.log('🔄 placeOrder: Inserting order items...')

  const orderItems = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    console.error('❌ Order items insert error:', {
      code: itemsError.code,
      message: itemsError.message,
      details: itemsError.details,
    })
    await supabase.from('orders').delete().eq('id', order.id)
    return { error: `Failed to save order items: ${itemsError.message}` }
  }

  console.log('✅ Order items created:', orderItems.length, 'items')

  // ── Batch update stock (optimized) ──────────────────────
  console.log('🔄 placeOrder: Updating product stock...')
  const stockUpdates = payload.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!
    return {
      id: item.productId,
      stock_quantity: product.stock_quantity - item.quantity,
    }
  })

  // Update each product's stock
  for (const update of stockUpdates) {
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock_quantity: update.stock_quantity })
      .eq('id', update.id)

    if (stockError) {
      console.error('❌ Stock update error for product:', update.id, stockError)
      return { error: `Failed to update stock quantities: ${stockError.message}` }
    }
  }

  console.log('✅ Stock updated for', stockUpdates.length, 'products')

  return { orderId: order.id, orderNumber: order.id.slice(0, 8).toUpperCase() }
  } catch (error) {
    console.error('❌ UNCAUGHT ERROR in placeOrder:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
    return { error: `Order placement failed: ${errorMsg}` }
  }
}

/**
 * Background task to sync order to Google Sheets
 * Called asynchronously after order creation
 */
async function syncOrderToGoogleSheetsBackground(
  orderId: string,
  customerName: string,
  total: number,
  tenantId: string,
  currency: string,
  itemsCount: number,
  customerEmail?: string,
  customerPhone?: string,
  deliveryAddress?: string
): Promise<void> {
  try {
    await sendOrderToGoogleSheetWithRetry(
      {
        order_id: orderId,
        customer_name: customerName,
        total,
        status: 'pending',
        created_at: new Date().toISOString(),
        items_count: itemsCount,
        currency,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
      },
      tenantId,
      3 // Max 3 retries
    )
  } catch (error) {
    console.error('Error in Google Sheets sync background task', error)
  }
}

// ── Dashboard: update order status ───────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  businessSlug: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Verify the order belongs to a business owned by this user
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, business_id')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return { error: 'Order not found.' }
  }

  // Verify business ownership
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('owner_id')
    .eq('id', order.business_id)
    .single()

  if (bizError || !business || business.owner_id !== user.id) {
    return { error: 'Access denied.' }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return { error: error.message }

  // Sync status update to Google Sheets (background, non-blocking)
  syncOrderStatusToGoogleSheetsBackground(orderId, status, user.id).catch((error) => {
    console.error('Background Google Sheets sync failed for status update', orderId, error)
    // Don't throw - we don't want to break the status update
  })

  revalidatePath(`/${businessSlug}/orders`)
  revalidatePath(`/${businessSlug}/orders/${orderId}`)
  revalidatePath(`/${businessSlug}`)
  return {}
}

/**
 * Background task to sync order status update to Google Sheets
 */
async function syncOrderStatusToGoogleSheetsBackground(
  orderId: string,
  newStatus: OrderStatus,
  userId: string
): Promise<void> {
  try {
    const supabase = await createClient()

    // Get the order with business info
    const { data: order } = await supabase
      .from('orders')
      .select('id, total_amount, created_at, status, businesses(owner_id)')
      .eq('id', orderId)
      .single()

    if (!order) {
      console.warn('Order not found for Google Sheets sync', orderId)
      return
    }

    const businessData = (order as any).businesses
    if (!businessData) {
      console.warn('Business data not found for order', orderId)
      return
    }

    await sendOrderToGoogleSheetWithRetry(
      {
        order_id: (order as any)?.id,
        customer_name: 'Customer',
        total: (order as any)?.total_amount,
        status: newStatus as any,
        created_at: (order as any)?.created_at,
        items_count: 0,
        currency: (order as any)?.currency || 'PKR',
      },
      businessData.owner_id,
      3 // Max 3 retries
    )
  } catch (error) {
    console.error('Error in Google Sheets status sync background task', error)
  }
}
