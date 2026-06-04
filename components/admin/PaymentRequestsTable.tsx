'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils/format'
import { approvePaymentRequest, rejectPaymentRequest } from '@/lib/actions/payment'
import { Button } from '@/components/ui/Button'
import type { PaymentRequest } from '@/types/models'

interface PaymentRequestsTableProps {
  requests: PaymentRequest[]
  profileMap: Map<string, { id: string; email: string; full_name: string | null }>
}

export function PaymentRequestsTable({ requests, profileMap }: PaymentRequestsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  const handleApprove = async (id: string) => {
    setLoading(id)
    const result = await approvePaymentRequest(id, adminNotes[id])
    if (result.success) {
      // Refresh would happen via server revalidation
      window.location.reload()
    }
    setLoading(null)
  }

  const handleReject = async (id: string) => {
    setLoading(id)
    const result = await rejectPaymentRequest(id, adminNotes[id])
    if (result.success) {
      window.location.reload()
    }
    setLoading(null)
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">No payment requests yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="px-6 py-3 text-left font-semibold text-slate-300">User</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-300">Plan</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-300">Method</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-300">Transaction ID</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-300">Date</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-300">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => {
            const profile = profileMap.get(req.user_id)
            const isExpanded = expandedId === req.id
            const isPending = req.status === 'pending'

            return (
              <tr key={req.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-white">{profile?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{profile?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-white">{req.plan_name}</p>
                    <p className="text-xs text-slate-400">{req.plan_price}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-300 capitalize">{req.payment_method}</span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                    {req.transaction_id}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {formatDate(req.created_at)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
                  >
                    {isExpanded ? 'Hide' : 'View'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Expanded row for details */}
      {expandedId && (
        <div className="bg-slate-800 border-t border-slate-700 p-6">
          {(() => {
            const req = requests.find((r) => r.id === expandedId)
            if (!req) return null

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Screenshot</p>
                    {req.screenshot_url && (
                      <img
                        src={req.screenshot_url}
                        alt="Payment screenshot"
                        className="max-w-xs rounded-lg border border-slate-700"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Admin Notes</p>
                      <textarea
                        value={adminNotes[req.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [req.id]: e.target.value })}
                        placeholder="Add notes for approval/rejection..."
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        rows={3}
                      />
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(req.id)}
                          disabled={loading === req.id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {loading === req.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(req.id)}
                          disabled={loading === req.id}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          {loading === req.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    )}

                    {req.status !== 'pending' && (
                      <div className="bg-slate-700 rounded px-3 py-2">
                        <p className="text-xs text-slate-300">
                          <span className="font-semibold">Status:</span> {req.status.toUpperCase()}
                        </p>
                        {req.admin_notes && (
                          <p className="text-xs text-slate-400 mt-1">
                            <span className="font-semibold">Notes:</span> {req.admin_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-900/30 text-yellow-300',
    approved: 'bg-emerald-900/30 text-emerald-300',
    rejected: 'bg-red-900/30 text-red-300',
  }

  return (
    <span className={`${colors[status as keyof typeof colors] || 'bg-slate-700 text-slate-300'} px-2 py-1 rounded text-xs font-semibold capitalize`}>
      {status}
    </span>
  )
}
