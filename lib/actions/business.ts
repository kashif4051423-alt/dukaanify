'use server'

import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/format'
import { isAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type BusinessFormState = {
  error?: string
  fieldErrors?: { name?: string; slug?: string; logo?: string }
  success?: boolean
  redirectTo?: string
}

// ── Create business ──────────────────────────────────────────
export async function createBusiness(
  _prev: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to create a business.' }
  }

  // ── Business limit: non-admins can only create 1 business ──
  if (!isAdmin(user.email)) {
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)

    if ((count ?? 0) >= 1) {
      return {
        error: 'Free accounts can only create 1 business. Contact the admin to upgrade your account.',
      }
    }
  }

  // Read form fields safely
  const rawName = formData.get('name')
  const rawSlug = formData.get('slug')
  const rawDescription = formData.get('description')
  const rawCurrency = formData.get('currency')
  const logoFile = formData.get('logo') as File | null

  const name = typeof rawName === 'string' ? rawName.trim() : ''
  const description = typeof rawDescription === 'string' && rawDescription.trim() ? rawDescription.trim() : null
  const currency = typeof rawCurrency === 'string' && rawCurrency ? rawCurrency : 'INR'
  const customSlug = typeof rawSlug === 'string' ? rawSlug.trim() : ''

  // Validate name
  if (!name || name.length < 2) {
    return { fieldErrors: { name: 'Business name must be at least 2 characters.' } }
  }

  // Generate slug
  const slug = customSlug ? slugify(customSlug) : slugify(name)
  if (!slug) {
    return { fieldErrors: { slug: 'Could not generate a valid URL. Try a different name.' } }
  }

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return { fieldErrors: { slug: `The URL "/${slug}" is already taken. Try a different name.` } }
  }

  // Upload logo if provided (skip if storage bucket doesn't exist yet)
  let logo_url: string | null = null
  if (logoFile && logoFile.size > 0) {
    try {
      const ext = logoFile.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${slug}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(path, logoFile, { upsert: true })

      if (uploadError) {
        // Logo upload failure is non-fatal — continue without logo
        console.warn('Logo upload failed:', uploadError.message)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('business-logos')
          .getPublicUrl(path)
        logo_url = publicUrl
      }
    } catch {
      // Storage not configured — skip logo silently
    }
  }

  // Insert the business row
  const { data: newBusiness, error: insertError } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name,
      slug,
      description,
      logo_url,
      currency: currency || 'PKR',
      is_active: true,
    })
    .select('id, slug')
    .single()

  if (insertError) {
    // Unique constraint violation on slug
    if (insertError.code === '23505') {
      return { fieldErrors: { slug: `The URL "/${slug}" is already taken.` } }
    }
    return { error: `Failed to create business: ${insertError.message}` }
  }

  if (!newBusiness) {
    return { error: 'Business was not created. Please try again.' }
  }

  revalidatePath('/dashboard')

  // Return redirectTo instead of calling redirect() directly.
  // redirect() inside useActionState causes "unexpected response" in Next.js 16.
  // The client component handles the navigation via router.push().
  return { success: true, redirectTo: `/${newBusiness.slug}` }
}

// ── Update business ──────────────────────────────────────────
export async function updateBusiness(
  businessId: string,
  _prev: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug, logo_url')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  if (!business) return { error: 'Business not found.' }

  const name = (formData.get('name') as string ?? '').trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const currency = (formData.get('currency') as string) || 'INR'
  const logoFile = formData.get('logo') as File | null

  if (!name || name.length < 2) {
    return { fieldErrors: { name: 'Name must be at least 2 characters.' } }
  }

  let logo_url = business.logo_url
  if (logoFile && logoFile.size > 0) {
    try {
      const ext = logoFile.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${business.slug}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(path, logoFile, { upsert: true })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('business-logos')
          .getPublicUrl(path)
        logo_url = publicUrl
      }
    } catch {
      // Storage not configured — skip
    }
  }

  // Build update payload — only include whatsapp_number if it was submitted
  // (column may not exist in DB yet — see setup.sql to add it)
  type UpdatePayload = {
    name: string
    description: string | null
    logo_url: string | null
    updated_at: string
    whatsapp_number?: string | null
    jazzcash_number?: string | null
    easypaisa_number?: string | null
    sadapay_number?: string | null
  }

  const updatePayload: UpdatePayload = {
    name,
    description,
    logo_url,
    updated_at: new Date().toISOString(),
  }

  // Only add whatsapp_number if the form field was present
  const rawWhatsapp = formData.get('whatsapp_number')
  if (rawWhatsapp !== null) {
    const cleaned = (rawWhatsapp as string).trim().replace(/\D/g, '') || null
    updatePayload.whatsapp_number = cleaned
  }

  // Payment account numbers
  const rawJazzcash = formData.get('jazzcash_number')
  if (rawJazzcash !== null) updatePayload.jazzcash_number = (rawJazzcash as string).trim() || null

  const rawEasypaisa = formData.get('easypaisa_number')
  if (rawEasypaisa !== null) updatePayload.easypaisa_number = (rawEasypaisa as string).trim() || null

  const rawSadapay = formData.get('sadapay_number')
  if (rawSadapay !== null) updatePayload.sadapay_number = (rawSadapay as string).trim() || null

  const { error } = await supabase
    .from('businesses')
    .update(updatePayload)
    .eq('id', businessId)

  if (error) {
    // If new columns don't exist yet, retry without them
    if (error.message.includes('whatsapp_number') || error.message.includes('jazzcash') || error.message.includes('easypaisa') || error.message.includes('sadapay')) {
      const { whatsapp_number: _w, jazzcash_number: _j, easypaisa_number: _e, sadapay_number: _s, ...safePayload } = updatePayload
      void _w; void _j; void _e; void _s
      const { error: retryError } = await supabase
        .from('businesses')
        .update(safePayload)
        .eq('id', businessId)
      if (retryError) return { error: retryError.message }
    } else {
      return { error: error.message }
    }
  }

  revalidatePath(`/${business.slug}`)
  revalidatePath(`/${business.slug}/settings`)
  revalidatePath('/dashboard')
  return { success: true }
}

// ── Delete business ──────────────────────────────────────────
export async function deleteBusiness(businessId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: business } = await supabase
    .from('businesses')
    .select('slug')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  if (!business) return { error: 'Business not found.' }

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ── Check slug availability ───────────────────────────────────
export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  return !data
}
