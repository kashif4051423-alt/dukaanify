'use client'

import { formatCurrency } from '@/lib/utils/format'

interface Props {
  data: Array<{ date: string; revenue: number }>
  currency: string
}

export function RevenueChart({ data, currency }: Props) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const scale = 100 / maxRevenue

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Revenue - Last 7 Days</h3>
      <div className="space-y-2">
        {data.map((day) => (
          <div key={day.date} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-12">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div className="flex-1 h-8 bg-gray-100 rounded overflow-hidden">
              {day.revenue > 0 && (
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${day.revenue * scale}%` }}
                />
              )}
            </div>
            <span className="text-xs font-semibold text-gray-900 w-16 text-right">
              {formatCurrency(day.revenue, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
