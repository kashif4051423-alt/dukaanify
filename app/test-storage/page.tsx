'use client'

import { useState } from 'react'
import { runDiagnostics, type DiagnosticResult } from '@/lib/debug-storage'
import { uploadProductImage } from '@/lib/uploadImage'

export default function TestStoragePage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleRunDiagnostics = async () => {
    setLoading(true)
    setDiagnostics([])
    try {
      const results = await runDiagnostics()
      setDiagnostics(results)
    } catch (error) {
      console.error('Diagnostic error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadResult(null)
    setUploadError(null)
    setLoading(true)

    try {
      console.log('🧪 Starting test upload with file:', file.name)
      const url = await uploadProductImage(file, 'test-store-123')
      setUploadResult(url)
      console.log('✅ Upload successful:', url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUploadError(message)
      console.error('❌ Upload failed:', message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Supabase Storage Diagnostics</h1>
        <p className="text-gray-600 mb-8">
          Debug the "Bucket not found" error by running these tests
        </p>

        {/* Run Diagnostics Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Run Diagnostics</h2>
          <p className="text-sm text-gray-600 mb-4">
            This will check your environment variables, authentication, and bucket existence.
          </p>
          <button
            onClick={handleRunDiagnostics}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Running...' : 'Run Diagnostics'}
          </button>

          {/* Diagnostic Results */}
          {diagnostics.length > 0 && (
            <div className="mt-6 space-y-3">
              {diagnostics.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.status === 'success'
                      ? 'border-green-300 bg-green-50'
                      : result.status === 'error'
                      ? 'border-red-300 bg-red-50'
                      : 'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{result.step}</h3>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="text-sm space-y-1">
                  <p>
                    ✅ Success:{' '}
                    {diagnostics.filter((r) => r.status === 'success').length}
                  </p>
                  <p>
                    ⚠️ Warnings:{' '}
                    {diagnostics.filter((r) => r.status === 'warning').length}
                  </p>
                  <p>
                    ❌ Errors:{' '}
                    {diagnostics.filter((r) => r.status === 'error').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Test Upload</h2>
          <p className="text-sm text-gray-600 mb-4">
            Try uploading a test image (jpg, png, or webp, max 2MB).
          </p>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleTestUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">Uploading... Check browser console for details.</p>
            </div>
          )}

          {uploadResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Upload Successful!</h3>
              <p className="text-sm text-green-700 break-all">{uploadResult}</p>
              <img
                src={uploadResult}
                alt="Uploaded"
                className="mt-3 max-w-xs rounded border"
              />
            </div>
          )}

          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ Upload Failed</h3>
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">📋 Troubleshooting Steps</h2>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>
              <strong>Run diagnostics first</strong> to identify the issue
            </li>
            <li>
              <strong>Check your browser console</strong> (F12) for detailed logs
            </li>
            <li>
              If bucket not found: Go to{' '}
              <a
                href="https://app.supabase.com/project/iprvwdsniwmspdmewzbs/storage/buckets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Supabase Dashboard
              </a>{' '}
              and create bucket "product-images" (public)
            </li>
            <li>
              <strong>Restart your dev server</strong> after changing .env.local
            </li>
            <li>
              Make sure you're <strong>logged in</strong> (RLS policies require authentication)
            </li>
          </ol>
        </div>

        {/* Open Console Reminder */}
        <div className="mt-4 text-center text-sm text-gray-600">
          💡 Open your browser console (F12) to see detailed logs
        </div>
      </div>
    </div>
  )
}
