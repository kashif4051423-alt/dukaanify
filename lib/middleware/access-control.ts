/**
 * Access Control Middleware
 * Enforces role-based access control for multi-tenant SaaS
 */

import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/utils/auth'

export type AccessLevel = 'public' | 'authenticated' | 'owner' | 'admin'

/**
 * Check if user has access to a business dashboard
 * - Admin: can access any business
 * - Owner: can only access their own business
 * - Others: denied
 */
export async function checkBusinessAccess(businessSlug: string): Promise<{
  allowed: boolean
  reason?: string
  business?: any
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false, reason: 'Not authenticated' }
  }

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .single()

  if (!business) {
    return { allowed: false, reason: 'Business not found' }
  }

  // Admin can access any business
  if (isAdmin(user.email)) {
    return { allowed: true, business }
  }

  // Owner can only access their own business
  if (business.owner_id === user.id) {
    return { allowed: true, business }
  }

  return { allowed: false, reason: 'Not authorized to access this business' }
}

/**
 * Check if user is admin
 */
export async function checkAdminAccess(): Promise<{
  allowed: boolean
  reason?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false, reason: 'Not authenticated' }
  }

  if (isAdmin(user.email)) {
    return { allowed: true }
  }

  return { allowed: false, reason: 'Admin access required' }
}

/**
 * Check if user owns a business by ID
 */
export async function checkBusinessOwnership(businessId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false, reason: 'Not authenticated' }
  }

  // Admin can access any business
  if (isAdmin(user.email)) {
    return { allowed: true }
  }

  // Check ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  if (business) {
    return { allowed: true }
  }

  return { allowed: false, reason: 'Not authorized to access this business' }
}
