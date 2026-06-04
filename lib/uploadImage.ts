import { createClient } from './supabase/client'

/**
 * Allowed file types for image uploads
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Maximum file size in bytes (2MB)
 */
const MAX_FILE_SIZE = 2 * 1024 * 1024

/**
 * Supabase storage bucket name
 */
const BUCKET_NAME = 'product-images'

/**
 * Generates a random filename to avoid conflicts
 * @param originalName - Original filename with extension
 * @returns Random filename with original extension
 */
function generateRandomFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}.${ext}`
}

/**
 * Extracts file extension from filename or MIME type
 * @param file - File object
 * @returns File extension (e.g., 'jpg', 'png')
 */
function getFileExtension(file: File): string {
  // Try to get from filename first
  const nameExt = file.name.split('.').pop()?.toLowerCase()
  if (nameExt && ['jpg', 'jpeg', 'png', 'webp'].includes(nameExt)) {
    return nameExt
  }

  // Fall back to MIME type
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  }
  return mimeToExt[file.type] || 'jpg'
}

/**
 * Validates file type
 * @param file - File object to validate
 * @throws Error if file type is not allowed
 */
function validateFileType(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    const allowed = ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')
    throw new Error(`Invalid file type. Only ${allowed} are allowed.`)
  }
}

/**
 * Validates file size
 * @param file - File object to validate
 * @throws Error if file size exceeds limit
 */
function validateFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
    throw new Error(`File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
  }
}

/**
 * Uploads a product image to Supabase storage
 * 
 * @param file - File object to upload
 * @param storeId - Store/Business ID for folder organization
 * @returns Promise resolving to the public URL of the uploaded image
 * @throws Error if upload fails or validation fails
 * 
 * @example
 * ```typescript
 * try {
 *   const url = await uploadProductImage(file, 'business-123')
 *   console.log('Image uploaded:', url)
 * } catch (error) {
 *   console.error('Upload failed:', error.message)
 * }
 * ```
 */
export async function uploadProductImage(
  file: File,
  storeId: string
): Promise<string> {
  try {
    // Debug: Log environment variables
    console.log('[uploadProductImage] Environment check:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      bucketName: BUCKET_NAME
    })

    // Validate inputs
    if (!file) {
      throw new Error('No file provided')
    }

    if (!storeId || typeof storeId !== 'string') {
      throw new Error('Invalid store ID')
    }

    console.log('[uploadProductImage] Input validation passed:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storeId
    })

    // Validate file type
    validateFileType(file)

    // Validate file size
    validateFileSize(file)

    // Generate random filename
    const fileName = generateRandomFileName(file.name)

    // Create file path: {storeId}/{randomFileName}.{ext}
    const filePath = `${storeId}/${fileName}`

    console.log('[uploadProductImage] Generated file path:', filePath)

    // Get Supabase client
    const supabase = createClient()

    console.log('[uploadProductImage] Supabase client created, attempting upload to bucket:', BUCKET_NAME)

    // Upload file to storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: false // Don't overwrite existing files
      })

    if (uploadError) {
      console.error('[uploadProductImage] Upload error details:', {
        message: uploadError.message,
        name: uploadError.name,
        cause: uploadError.cause,
        stack: uploadError.stack
      })
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    if (!data) {
      throw new Error('Upload completed but no file data returned')
    }

    console.log('[uploadProductImage] Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to generate public URL')
    }

    console.log('[uploadProductImage] Public URL generated:', urlData.publicUrl)

    return urlData.publicUrl
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('[uploadProductImage] Error:', errorMessage)
    throw new Error(errorMessage)
  }
}

/**
 * Deletes an image from Supabase storage
 * 
 * @param publicUrl - Public URL of the image to delete
 * @returns Promise resolving when deletion is complete
 * @throws Error if deletion fails
 * 
 * @example
 * ```typescript
 * try {
 *   await deleteProductImage(imageUrl)
 *   console.log('Image deleted successfully')
 * } catch (error) {
 *   console.error('Delete failed:', error.message)
 * }
 * ```
 */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  try {
    if (!publicUrl) {
      throw new Error('No image URL provided')
    }

    // Extract file path from public URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/product-images/{storeId}/{fileName}
    const pathMatch = publicUrl.match(/\/product-images\/(.+)$/)
    if (!pathMatch || !pathMatch[1]) {
      throw new Error('Invalid image URL format')
    }

    const filePath = pathMatch[1]

    // Get Supabase client
    const supabase = createClient()

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('[deleteProductImage] Error:', errorMessage)
    throw new Error(errorMessage)
  }
}

/**
 * Gets a signed URL for temporary access to a private image
 * 
 * @param publicUrl - Public URL of the image
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise resolving to the signed URL
 * @throws Error if URL generation fails
 * 
 * @example
 * ```typescript
 * const signedUrl = await getSignedImageUrl(imageUrl, 7200) // 2 hours
 * ```
 */
export async function getSignedImageUrl(
  publicUrl: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    if (!publicUrl) {
      throw new Error('No image URL provided')
    }

    // Extract file path from public URL
    const pathMatch = publicUrl.match(/\/product-images\/(.+)$/)
    if (!pathMatch || !pathMatch[1]) {
      throw new Error('Invalid image URL format')
    }

    const filePath = pathMatch[1]

    // Get Supabase client
    const supabase = createClient()

    // Create signed URL
    const { data, error: signError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn)

    if (signError) {
      throw new Error(`Failed to create signed URL: ${signError.message}`)
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned')
    }

    return data.signedUrl
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('[getSignedImageUrl] Error:', errorMessage)
    throw new Error(errorMessage)
  }
}

/**
 * Lists all images in a store folder
 * 
 * @param storeId - Store/Business ID
 * @returns Promise resolving to array of image objects
 * @throws Error if listing fails
 * 
 * @example
 * ```typescript
 * const images = await listStoreImages('business-123')
 * ```
 */
export async function listStoreImages(storeId: string): Promise<any[]> {
  try {
    if (!storeId) {
      throw new Error('No store ID provided')
    }

    // Get Supabase client
    const supabase = createClient()

    // List files in store folder
    const { data, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(storeId)

    if (listError) {
      throw new Error(`Failed to list images: ${listError.message}`)
    }

    return data ?? []
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('[listStoreImages] Error:', errorMessage)
    throw new Error(errorMessage)
  }
}

/**
 * Export configuration for reference
 */
export const uploadConfig = {
  allowedTypes: ALLOWED_TYPES,
  maxFileSize: MAX_FILE_SIZE,
  maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
  bucketName: BUCKET_NAME
}
