import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Upload product image to Supabase Storage
 * @param supabase - Supabase client (server or client)
 * @param file - Image file to upload
 * @param businessId - Business ID (used as folder name)
 * @returns { url, error } - Public URL or error message
 */
export async function uploadProductImage(
  supabase: SupabaseClient<any>,
  file: File,
  businessId: string,
  productId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: 'No file provided' }
    }

    // File size check (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      return { url: null, error: 'File must be under 5MB' }
    }

    // Validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { url: null, error: 'Only JPEG, PNG, WebP, and GIF allowed' }
    }

    // Generate file name
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const timestamp = Date.now()
    const filename = productId 
      ? `${productId}-${timestamp}.${ext}`
      : `${timestamp}.${ext}`
    
    const path = `${businessId}/${filename}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { url: null, error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    return { url: publicUrl, error: null }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    console.error('Upload error:', errorMsg)
    return { url: null, error: errorMsg }
  }
}

/**
 * Delete product image from Supabase Storage
 * @param supabase - Supabase client
 * @param imageUrl - Public URL of the image to delete
 * @returns { success, error }
 */
export async function deleteProductImage(
  supabase: SupabaseClient<any>,
  imageUrl: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!imageUrl) {
      return { success: false, error: 'No image URL provided' }
    }

    // Extract path from public URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/{businessId}/{filename}
    const urlParts = imageUrl.split('product-images/')
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid image URL format' }
    }

    const path = urlParts[1]

    const { error } = await supabase.storage
      .from('product-images')
      .remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    console.error('Delete error:', errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Generate a signed URL for temporary access (optional)
 * Useful for private images or time-limited access
 * @param supabase - Supabase client
 * @param path - Image path in storage
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns { url, error }
 */
export async function getSignedImageUrl(
  supabase: SupabaseClient<any>,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .createSignedUrl(path, expiresIn)

    if (error) {
      return { url: null, error: error.message }
    }

    return { url: data.signedUrl, error: null }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    return { url: null, error: errorMsg }
  }
}

/**
 * List all images in a business folder
 * @param supabase - Supabase client
 * @param businessId - Business ID (folder name)
 * @returns { files, error }
 */
export async function listBusinessImages(
  supabase: SupabaseClient<any>,
  businessId: string
): Promise<{ files: any[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .list(businessId)

    if (error) {
      return { files: null, error: error.message }
    }

    return { files: data ?? [], error: null }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    return { files: null, error: errorMsg }
  }
}
