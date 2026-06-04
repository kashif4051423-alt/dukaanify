'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProductFormState = {
  error?: string
  success?: boolean
  fieldErrors?: {
    name?: string
    price?: string
    stock_quantity?: string
    image?: string
  }
}

// ── Ownership guard ───────────────────────────────────────────
async function getOwnedBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, business: null }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  return { supabase, user, business }
}

// ── Upload image helper ───────────────────────────────────────
// Returns { url, error } so callers can decide whether to fail or continue
async function uploadImage(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      return { url: null, error: uploadError.message }
    }

    // getPublicUrl never fails — it just constructs the URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    return { url: publicUrl, error: null }
  } catch (e) {
    return { url: null, error: String(e) }
  }
}

// ── Create product ────────────────────────────────────────────
export async function createProduct(
  businessId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { supabase, business } = await getOwnedBusiness(businessId)
  if (!business) return { error: 'Business not found or access denied.' }

  const name = (formData.get('name') as string ?? '').trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const priceRaw = formData.get('price') as string
  const price = parseFloat(priceRaw)
  const stockRaw = formData.get('stock_quantity') as string
  const stock_quantity = parseInt(stockRaw) || 0
  
  // Get image_url from ImageUploader component (already uploaded to Supabase)
  const image_url = (formData.get('image_url') as string | null)?.trim() || null

  // Validation
  if (!name || name.length < 2) {
    return { fieldErrors: { name: 'Product name must be at least 2 characters.' } }
  }
  if (!priceRaw || isNaN(price) || price < 0) {
    return { fieldErrors: { price: 'Enter a valid price (e.g. 500).' } }
  }

  const { error } = await supabase.from('products').insert({
    business_id: businessId,
    name,
    description,
    price,
    stock_quantity,
    image_url,
    is_active: true,
  })

  if (error) return { error: `Failed to add product: ${error.message}` }

  revalidatePath(`/${business.slug}/products`)
  return { success: true }
}

// ── Update product ────────────────────────────────────────────
export async function updateProduct(
  productId: string,
  businessId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { supabase, business } = await getOwnedBusiness(businessId)
  if (!business) return { error: 'Business not found or access denied.' }

  const name = (formData.get('name') as string ?? '').trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const price = parseFloat(formData.get('price') as string)
  const stock_quantity = parseInt(formData.get('stock_quantity') as string) || 0
  const is_active = formData.get('is_active') !== 'false'
  
  // Get image_url from ImageUploader component (already uploaded to Supabase)
  const new_image_url = (formData.get('image_url') as string | null)?.trim() || null

  if (!name || name.length < 2) {
    return { fieldErrors: { name: 'Product name must be at least 2 characters.' } }
  }
  if (isNaN(price) || price < 0) {
    return { fieldErrors: { price: 'Enter a valid price.' } }
  }

  // Keep existing image unless a new one is provided from ImageUploader
  const { data: existing } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', productId)
    .single()

  const image_url = new_image_url || existing?.image_url || null

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description,
      price,
      stock_quantity,
      image_url,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .eq('business_id', businessId) // extra safety

  if (error) return { error: `Failed to update product: ${error.message}` }

  revalidatePath(`/${business.slug}/products`)
  return { success: true }
}

// ── Delete product ────────────────────────────────────────────
export async function deleteProduct(
  productId: string,
  businessId: string
): Promise<{ error?: string }> {
  const { supabase, business } = await getOwnedBusiness(businessId)
  if (!business) return { error: 'Business not found or access denied.' }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('business_id', businessId) // extra safety

  if (error) return { error: error.message }

  revalidatePath(`/${business.slug}/products`)
  return {}
}

// ── Toggle active status ──────────────────────────────────────
export async function toggleProductActive(
  productId: string,
  businessId: string,
  is_active: boolean
): Promise<{ error?: string }> {
  const { supabase, business } = await getOwnedBusiness(businessId)
  if (!business) return { error: 'Access denied.' }

  const { error } = await supabase
    .from('products')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .eq('business_id', businessId)

  if (error) return { error: error.message }

  revalidatePath(`/${business.slug}/products`)
  return {}
}
