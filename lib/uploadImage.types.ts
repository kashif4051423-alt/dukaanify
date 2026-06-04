/**
 * Type definitions for the image upload utility
 * Re-export these if you need them in other files
 */

/**
 * Configuration object for upload utility
 */
export interface UploadConfig {
  allowedTypes: string[]
  maxFileSize: number
  maxFileSizeMB: number
  bucketName: string
}

/**
 * Result of an upload operation
 */
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * File metadata after listing
 */
export interface FileMetadata {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata?: Record<string, any>
}

/**
 * Upload progress event
 */
export interface UploadProgress {
  loaded: number
  total: number
}

/**
 * Image upload options (for future extensibility)
 */
export interface ImageUploadOptions {
  cacheControl?: string
  upsert?: boolean
  metadata?: Record<string, any>
}

/**
 * Product image information
 */
export interface ProductImage {
  url: string
  storeId: string
  fileName: string
  uploadedAt: Date
  size?: number
  type?: string
}
