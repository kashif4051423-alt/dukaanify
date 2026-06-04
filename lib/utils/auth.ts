import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user is an admin
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  return email.toLowerCase() === adminEmail.toLowerCase()
}

/**
 * Check if the current user owns a specific business
 * Returns the business if owned, null otherwise
 */
export async function getOwnedBusiness(businessSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', businessSlug)
    .eq('owner_id', user.id)
    .single()

  return business ?? null
}

/**
 * Check if the current user owns a business by ID
 */
export async function getOwnedBusinessById(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  return business ?? null
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
