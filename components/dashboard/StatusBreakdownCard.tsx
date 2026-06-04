'use client'

interface Props {
  statusCounts: Record<string, number>
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  processing: { bg: 'bg-purple-100', text: 'text-purple-700' },
  shipped: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function StatusBreakdownCard({ statusCounts }: Props) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-center text-gray-500">
        No orders yet
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
      <div className="space-y-2">
        {Object.entries(statusCounts).map(([status, count]) => {
          if (count === 0) return null
          const percentage = (count / total) * 100
          const colors = STATUS_COLORS[status] || STATUS_COLORS.pending

          return (
            <div key={status} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-20 capitalize">
                {status}
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                <div
                  className={`h-full ${colors.bg} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${colors.text} w-10 text-right`}>
                {count}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4">Total: {total} orders</p>
    </div>
  )
}
