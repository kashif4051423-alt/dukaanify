'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { PaymentRequest } from '@/types/models'

export async function submitPaymentRequest(
  planId: string,
  planName: string,
  planPrice: string,
  paymentMethod: string,
  transactionId: string,
  screenshotUrl: string
): Promise<{ success: boolean; error?: string; data?: PaymentRequest }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.id,
        plan_id: planId,
        plan_name: planName,
        plan_price: planPrice,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        screenshot_url: screenshotUrl,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as PaymentRequest }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function getPaymentRequests(): Promise<PaymentRequest[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment requests:', error)
      return []
    }

    return (data || []) as PaymentRequest[]
  } catch (err) {
    console.error('Error:', err)
    return []
  }
}

export async function getAllPaymentRequests(): Promise<PaymentRequest[]> {
  try {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await service
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all payment requests:', error)
      return []
    }

    return (data || []) as PaymentRequest[]
  } catch (err) {
    console.error('Error:', err)
    return []
  }
}

export async function approvePaymentRequest(
  paymentRequestId: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await service
      .from('payment_requests')
      .update({
        status: 'approved',
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRequestId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function rejectPaymentRequest(
  paymentRequestId: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await service
      .from('payment_requests')
      .update({
        status: 'rejected',
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRequestId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
