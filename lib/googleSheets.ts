/**
 * Google Sheets Integration for Multi-Tenant SaaS
 * Sends order data to Google Sheets via Apps Script Web App
 */

interface OrderData {
  order_id: string
  customer_name: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at?: string
  items_count?: number
  currency?: string
  [key: string]: any // Allow additional fields
}

interface GoogleSheetsPayload {
  tenant_id: string
  order_id: string
  customer_name: string
  total: number
  status: string
  timestamp: string
  items_count?: number
  currency?: string
  additional_data?: Record<string, any>
}

interface GoogleSheetsResponse {
  success: boolean
  message?: string
  error?: string
  timestamp?: string
}

// Google Apps Script Web App URL
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz_fIk2WLKdVGc74xn35Vk2rtBh3yAra-FB1MBPdEFGNPI14sreynzar0H1RYLhphgy2w/exec'

// Timeout for Google Sheets request (5 seconds)
const REQUEST_TIMEOUT = 5000

/**
 * Send order data to Google Sheets
 * @param order - Order data object
 * @param tenantId - Tenant ID for multi-tenant SaaS
 * @returns Promise with success/error status
 */
export async function sendOrderToGoogleSheet(
  order: OrderData,
  tenantId: string
): Promise<GoogleSheetsResponse> {
  try {
    // Validate required fields
    if (!tenantId || !order.order_id || !order.customer_name) {
      console.warn('Missing required fields for Google Sheets sync', {
        tenantId,
        order_id: order.order_id,
        customer_name: order.customer_name,
      })
      return {
        success: false,
        error: 'Missing required fields: tenant_id, order_id, or customer_name',
      }
    }

    // Prepare payload
    const payload: GoogleSheetsPayload = {
      tenant_id: tenantId,
      order_id: order.order_id,
      customer_name: order.customer_name,
      total: order.total || 0,
      status: order.status || 'pending',
      timestamp: new Date().toISOString(),
      items_count: order.items_count,
      currency: order.currency || 'PKR',
      // Include any additional fields
      additional_data: Object.keys(order).reduce((acc, key) => {
        if (!['order_id', 'customer_name', 'total', 'status', 'created_at', 'items_count', 'currency'].includes(key)) {
          acc[key] = order[key]
        }
        return acc
      }, {} as Record<string, any>),
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      // Send POST request to Google Sheets
      const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if response is ok
      if (!response.ok) {
        console.error('Google Sheets API error:', {
          status: response.status,
          statusText: response.statusText,
          tenantId,
          orderId: order.order_id,
        })

        return {
          success: false,
          error: `Google Sheets API returned status ${response.status}`,
        }
      }

      // Parse response
      const data = await response.json()

      console.log('Order synced to Google Sheets successfully', {
        tenantId,
        orderId: order.order_id,
        timestamp: payload.timestamp,
      })

      return {
        success: true,
        message: 'Order synced to Google Sheets',
        timestamp: payload.timestamp,
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Google Sheets request timeout', {
          tenantId,
          orderId: order.order_id,
          timeout: REQUEST_TIMEOUT,
        })

        return {
          success: false,
          error: 'Request timeout - Google Sheets service took too long to respond',
        }
      }

      throw fetchError
    }
  } catch (error) {
    // Log error but don't throw - we don't want to break the order creation
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Failed to sync order to Google Sheets', {
      error: errorMessage,
      tenantId,
      orderId: order.order_id,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return {
      success: false,
      error: `Failed to sync to Google Sheets: ${errorMessage}`,
    }
  }
}

/**
 * Batch send multiple orders to Google Sheets
 * Useful for syncing historical orders
 * @param orders - Array of orders with tenant IDs
 * @returns Promise with results for each order
 */
export async function sendOrdersToGoogleSheetBatch(
  orders: Array<{ order: OrderData; tenantId: string }>
): Promise<GoogleSheetsResponse[]> {
  try {
    // Send all orders in parallel with Promise.all
    const results = await Promise.all(
      orders.map(({ order, tenantId }) => sendOrderToGoogleSheet(order, tenantId))
    )

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    console.log('Batch sync completed', {
      total: orders.length,
      success: successCount,
      failed: failureCount,
    })

    return results
  } catch (error) {
    console.error('Batch sync failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      orderCount: orders.length,
    })

    return orders.map(() => ({
      success: false,
      error: 'Batch sync failed',
    }))
  }
}

/**
 * Retry sending order to Google Sheets with exponential backoff
 * Useful for handling temporary failures
 * @param order - Order data
 * @param tenantId - Tenant ID
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Promise with final result
 */
export async function sendOrderToGoogleSheetWithRetry(
  order: OrderData,
  tenantId: string,
  maxRetries: number = 3
): Promise<GoogleSheetsResponse> {
  let lastError: GoogleSheetsResponse | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendOrderToGoogleSheet(order, tenantId)

      if (result.success) {
        return result
      }

      lastError = result

      // Only retry on certain errors (not validation errors)
      if (result.error?.includes('Missing required fields')) {
        return result
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000
        console.log(`Retrying Google Sheets sync in ${delayMs}ms (attempt ${attempt}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Retry attempt ${attempt} failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      lastError = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  console.error(`Failed to sync order after ${maxRetries} attempts`, {
    orderId: order.order_id,
    tenantId,
  })

  return lastError || { success: false, error: 'Max retries exceeded' }
}

/**
 * Test Google Sheets connection
 * Useful for debugging and verifying the webhook URL works
 * @returns Promise with test result
 */
export async function testGoogleSheetsConnection(): Promise<GoogleSheetsResponse> {
  const testOrder: OrderData = {
    order_id: 'TEST-' + Date.now(),
    customer_name: 'Test Customer',
    total: 0,
    status: 'pending',
  }

  const testTenantId = 'test-tenant-' + Date.now()

  console.log('Testing Google Sheets connection...')

  return sendOrderToGoogleSheet(testOrder, testTenantId)
}
