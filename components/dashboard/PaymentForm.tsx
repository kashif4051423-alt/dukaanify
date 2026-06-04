'use client'

import { useState } from 'react'
import { submitPaymentRequest } from '@/lib/actions/payment'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

interface PaymentFormProps {
  planId: string
  planName: string
  planPrice: string
  onSuccess?: () => void
}

export function PaymentForm({ planId, planName, planPrice, onSuccess }: PaymentFormProps) {
  const [step, setStep] = useState<'method' | 'upload'>('method')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [transactionId, setTransactionId] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setScreenshotFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!paymentMethod) {
      setError('Please select a payment method')
      return
    }

    if (!transactionId.trim()) {
      setError('Please enter transaction ID')
      return
    }

    if (!screenshotFile) {
      setError('Please upload payment screenshot')
      return
    }

    setLoading(true)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const result = await submitPaymentRequest(
          planId,
          planName,
          planPrice,
          paymentMethod,
          transactionId,
          base64
        )

        if (result.success) {
          setSuccess(true)
          setTransactionId('')
          setScreenshotFile(null)
          setPaymentMethod('')
          setTimeout(() => {
            onSuccess?.()
          }, 2000)
        } else {
          setError(result.error || 'Failed to submit payment request')
        }
        setLoading(false)
      }
      reader.readAsDataURL(screenshotFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <CheckIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="font-bold text-emerald-900 mb-1">Payment Request Submitted</h3>
        <p className="text-sm text-emerald-700 mb-4">
          We've received your payment details. Our team will verify and activate your plan within 24 hours.
        </p>
        <p className="text-xs text-emerald-600">
          Plan: <span className="font-semibold">{planName}</span> ({planPrice})
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      {/* Step 1: Select Payment Method */}
      {step === 'method' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'jazzcash', label: '🔴 JazzCash', number: '03269415471' },
              { id: 'easypaisa', label: '🟢 Easypaisa', number: '03269415471' },
              { id: 'bank', label: '🏦 Bank Transfer', number: 'Allied Bank' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setPaymentMethod(method.id)
                  setStep('upload')
                }}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  paymentMethod === method.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <p className="font-semibold text-sm">{method.label}</p>
                <p className="text-xs text-gray-500 mt-1">{method.number}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Upload Details */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Selected:</span> {paymentMethod.toUpperCase()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction ID / Reference Number
            </label>
            <Input
              type="text"
              placeholder="e.g., TXN123456789"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Screenshot
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
                id="screenshot-input"
              />
              <label htmlFor="screenshot-input" className="cursor-pointer">
                {screenshotFile ? (
                  <div>
                    <p className="text-sm font-semibold text-emerald-600">✓ {screenshotFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('method')}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <Button
              type="submit"
              disabled={loading || !transactionId || !screenshotFile}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
