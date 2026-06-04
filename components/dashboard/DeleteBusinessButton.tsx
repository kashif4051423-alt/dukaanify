'use client'

import { useState, useTransition } from 'react'
import { deleteBusiness } from '@/lib/actions/business'

export function DeleteBusinessButton({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBusiness(businessId)
      if (result?.error) setError(result.error)
    })
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-colors"
      >
        Delete Business
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">
        Are you sure you want to delete <span className="font-semibold">{businessName}</span>?
        This will permanently delete all products, orders, and customers. This cannot be undone.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors font-medium"
        >
          {isPending ? 'Deleting...' : 'Yes, delete permanently'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
