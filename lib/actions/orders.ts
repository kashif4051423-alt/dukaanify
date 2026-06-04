'use server'

/**
 * Server Actions for Order Management
 * Handles order creation and Google Sheets sync
 */

import { createClient } from '@/lib/supabase/server'
import { sendOrderToGoogleSheetWithRetry } from '@/lib/googleSheets'

interface CreateOrderInput {
  business_id: string
  customer_id?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  total_amount: number
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items?: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  notes?: string
}

interface CreateOrderResponse {
  success: boolean
  order_id?: string
  error?: string
  googleSheetsSync?: {
    success: boolean
    message?: string
    error?: string
  }
}

/**
 * Create order and sync to Google Sheets
 * This is the main function to call when creating a new order
 */
export async function createOrderWithGoogleSheetsSync(
  input: CreateOrderInput
): Promise<CreateOrderResponse> {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    // Get business to verify ownership and get tenant info
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, owner_id, name, currency')
      .eq('id', input.business_id)
      .single()

    if (businessError || !business) {
      return {
        success: false,
        error: 'Business not found',
      }
    }

    // Verify user owns this business
    if (business.owner_id !== user.id) {
      return {
        success: false,
        error: 'Unauthorized - you do not own this business',
      }
    }

    // Create or get customer
    let customerId = input.customer_id
    
    if (!customerId && input.customer_name) {
      // Create a new customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          business_id: input.business_id,
          name: input.customer_name,
          email: input.customer_email,
          phone: input.customer_phone,
        })
        .select('id')
        .single()

      if (customerError || !customer) {
        return {
          success: false,
          error: 'Failed to create customer',
        }
      }

      customerId = customer.id
    }

    // Create order in Supabase
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        business_id: input.business_id,
        customer_id: customerId,
        total_amount: input.total_amount,
        status: input.status || 'pending',
        notes: input.notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Failed to create order in Supabase', orderError)
      return {
        success: false,
        error: 'Failed to create order',
      }
    }

    // Sync to Google Sheets asynchronously (don't wait for it)
    // This ensures the order is created even if Google Sheets fails
    syncOrderToGoogleSheets(order, business.owner_id, business.currency).catch((error) => {
      console.error('Background Google Sheets sync failed', error)
      // Don't throw - we don't want to break the order creation
    })

    return {
      success: true,
      order_id: order.id,
      googleSheetsSync: {
        success: true,
        message: 'Order created. Google Sheets sync in progress...',
      },
    }
  } catch (error) {
    console.error('Error creating order', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Sync order to Google Sheets (background task)
 * Called asynchronously after order creation
 */
async function syncOrderToGoogleSheets(
  order: any,
  tenantId: string,
  currency: string,
  customerInfo?: any
): Promise<void> {
  try {
    const result = await sendOrderToGoogleSheetWithRetry(
      {
        order_id: order.id,
        customer_name: customerInfo?.name || 'Unknown',
        total: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        currency: currency,
        customer_email: customerInfo?.email,
        customer_phone: customerInfo?.phone,
      },
      tenantId,
      3 // Max 3 retries
    )

    if (!result.success) {
      console.error('Failed to sync order to Google Sheets after retries', {
        orderId: order.id,
        error: result.error,
      })
    }
  } catch (error) {
    console.error('Error in Google Sheets sync task', error)
  }
}

/**
 * Update order status and sync to Google Sheets
 * Call this when order status changes
 */
export async function updateOrderStatusWithGoogleSheetsSync(
  orderId: string,
  newStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
): Promise<CreateOrderResponse> {
  try {
    const supabase = await createClient()

    // Get the order with customer and business info
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, customers(name, email, phone), businesses(owner_id, currency)')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return {
        success: false,
        error: 'Order not found',
      }
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update order status',
      }
    }

    // Sync updated order to Google Sheets asynchronously
    syncOrderToGoogleSheets(
      { ...order, status: newStatus },
      order.businesses.owner_id,
      order.businesses.currency,
      order.customers
    ).catch((error) => {
      console.error('Background Google Sheets sync failed for status update', error)
    })

    return {
      success: true,
      order_id: orderId,
      googleSheetsSync: {
        success: true,
        message: 'Order status updated. Google Sheets sync in progress...',
      },
    }
  } catch (error) {
    console.error('Error updating order status', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Manually sync an existing order to Google Sheets
 * Useful for retrying failed syncs or syncing historical orders
 */
export async function manuallyRetryGoogleSheetsSync(orderId: string): Promise<CreateOrderResponse> {
  try {
    const supabase = await createClient()

    // Get the order with customer and business info
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, customers(name, email, phone), businesses(owner_id, currency)')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return {
        success: false,
        error: 'Order not found',
      }
    }

    // Sync to Google Sheets
    const result = await sendOrderToGoogleSheetWithRetry(
      {
        order_id: order.id,
        customer_name: order.customers?.name || 'Unknown',
        total: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        currency: order.businesses.currency,
        customer_email: order.customers?.email,
        customer_phone: order.customers?.phone,
      },
      order.businesses.owner_id,
      3
    )

    return {
      success: result.success,
      order_id: orderId,
      googleSheetsSync: result,
    }
  } catch (error) {
    console.error('Error retrying Google Sheets sync', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
