'use client'

import { useState, useRef } from 'react'
import { uploadProductImage } from '@/lib/uploadImage'
import Image from 'next/image'

interface ImageUploaderProps {
  storeId: string
  onUpload: (imageUrl: string) => void
  onError?: (error: string) => void
  maxSize?: number // in MB, default 2
  accept?: string // default: jpg, png, webp
}

export function ImageUploader({
  storeId,
  onUpload,
  onError,
  maxSize = 2,
  accept = '.jpg,.jpeg,.png,.webp'
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Generate preview from file
   */
  function generatePreview(file: File) {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  /**
   * Simulate upload progress
   */
  function simulateProgress() {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 100)
    return interval
  }

  /**
   * Handle file upload
   */
  async function handleFileUpload(file: File) {
    // Reset state
    setError(null)
    setIsUploading(true)

    // Generate preview
    generatePreview(file)

    // Start progress simulation
    const progressInterval = simulateProgress()

    try {
      console.log('🎯 [ImageUploader] Starting upload for file:', file.name, 'to storeId:', storeId)
      
      // Upload file
      const imageUrl = await uploadProductImage(file, storeId)

      console.log('✅ [ImageUploader] Upload successful, URL:', imageUrl)

      // Complete progress
      setProgress(100)
      clearInterval(progressInterval)

      // Set uploaded URL
      setUploadedUrl(imageUrl)

      // Call callback
      onUpload(imageUrl)

      // Reset after short delay
      setTimeout(() => {
        setProgress(0)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      const errorMessage =
        err instanceof Error ? err.message : 'Upload failed'
      
      console.error('❌ [ImageUploader] Upload failed:', errorMessage)
      
      setError(errorMessage)
      onError?.(errorMessage)
      setProgress(0)
      
      // Don't block the form - just show error but keep preview
      // User can still submit product without image
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Handle file input change
   */
  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Handle drag over
   */
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  /**
   * Handle drag leave
   */
  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  /**
   * Handle drop
   */
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    } else {
      setError('Please drop an image file')
      onError?.('Please drop an image file')
    }
  }

  /**
   * Reset upload state
   */
  function handleReset() {
    setPreview(null)
    setUploadedUrl(null)
    setError(null)
    setProgress(0)
  }

  /**
   * Trigger file input
   */
  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  // Show uploaded state
  const isUploaded = !!uploadedUrl

  return (
    <div className="w-full">
      {/* Main Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${isUploading ? 'opacity-75' : ''}
        `}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="hidden"
          aria-label="Upload product image"
        />

        {/* Upload Content */}
        <div className="space-y-4">
          {/* Preview */}
          {preview ? (
            <div className="relative mx-auto w-full max-w-xs mb-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            // Icon (when no preview)
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Main Text */}
          {isUploading ? (
            <div>
              <p className="text-lg font-medium text-gray-900">Uploading...</p>
              <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
            </div>
          ) : isUploaded ? (
            <div>
              <p className="text-lg font-medium text-green-900">
                Upload Successful ✓
              </p>
              <p className="text-sm text-green-600">Image ready for use</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop your image
              </p>
              <p className="text-sm text-gray-500">or click to select</p>
            </div>
          )}

          {/* Info Text */}
          <p className="text-xs text-gray-500">
            JPG, PNG, or WebP • Max {maxSize}MB
          </p>

          {/* Upload Button */}
          {!isUploading && (
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className={`
                inline-block px-6 py-2 rounded-lg font-medium
                transition-all duration-200
                ${
                  isUploaded
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isUploaded ? 'Upload Another' : 'Select Image'}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4 w-full max-w-xs mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900">Upload failed</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <p className="text-xs text-gray-600 mt-2">
            💡 Don't worry - you can still save the product without an image
          </p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-600 hover:text-red-700 mt-2 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Message */}
      {isUploaded && !error && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">
                Image uploaded successfully
              </p>
              <p className="text-xs text-green-600 mt-1 break-all">
                {uploadedUrl}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-green-600 hover:text-green-700 font-medium whitespace-nowrap ml-4"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {isUploaded && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={triggerFileInput}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            Upload Another Image
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
