'use client'

/**
 * Example: Create Order Form with Google Sheets Integration
 * This shows how to use the Google Sheets integration in your app
 */

import { useState } from 'react'
import { createOrderWithGoogleSheetsSync } from '@/lib/actions/orders'

interface CreateOrderFormProps {
  businessId: string
  onSuccess?: (orderId: string) => void
  onError?: (error: string) => void
}

export function CreateOrderForm({ businessId, onSuccess, onError }: CreateOrderFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    total_amount: '',
    notes: '',
  })
  const [syncStatus, setSyncStatus] = useState<{
    status: 'idle' | 'syncing' | 'success' | 'error'
    message?: string
  }>({ status: 'idle' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSyncStatus({ status: 'idle' })

    try {
      // Validate required fields
      if (!formData.customer_name || !formData.total_amount) {
        throw new Error('Please fill in all required fields')
      }

      // Show syncing status
      setSyncStatus({ status: 'syncing', message: 'Creating order and syncing to Google Sheets...' })

      // Create order with Google Sheets sync
      const result = await createOrderWithGoogleSheetsSync({
        business_id: businessId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email || undefined,
        customer_phone: formData.customer_phone || undefined,
        total_amount: parseFloat(formData.total_amount),
        notes: formData.notes || undefined,
        status: 'pending',
      })

      if (result.success) {
        // Success!
        setSyncStatus({
          status: 'success',
          message: `Order created successfully! Order ID: ${result.order_id}. Syncing to Google Sheets...`,
        })

        // Reset form
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          total_amount: '',
          notes: '',
        })

        // Call success callback
        if (onSuccess && result.order_id) {
          onSuccess(result.order_id)
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSyncStatus({ status: 'idle' })
        }, 3000)
      } else {
        throw new Error(result.error || 'Failed to create order')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      setSyncStatus({
        status: 'error',
        message: errorMessage,
      })

      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Order</h2>

      {/* Status Messages */}
      {syncStatus.status !== 'idle' && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            syncStatus.status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : syncStatus.status === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus.status === 'syncing' && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            {syncStatus.status === 'success' && <span className="text-xl">✓</span>}
            {syncStatus.status === 'error' && <span className="text-xl">✕</span>}
            <span>{syncStatus.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            placeholder="e.g., Ali Hassan"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            placeholder="ali@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount (PKR) *
          </label>
          <input
            type="number"
            name="total_amount"
            value={formData.total_amount}
            onChange={handleChange}
            required
            placeholder="5000"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special instructions..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {isLoading ? 'Creating Order...' : 'Create Order & Sync to Google Sheets'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Order is created in your database</li>
          <li>✓ Data is automatically sent to Google Sheets</li>
          <li>✓ If sync fails, it retries automatically</li>
          <li>✓ You'll see the order in Google Sheets within seconds</li>
        </ul>
      </div>
    </div>
  )
}
