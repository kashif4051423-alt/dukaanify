'use client'

import { formatCurrency } from '@/lib/utils/format'

interface DayData {
  label: string
  date: string
  revenue: number
  count: number
}

interface Props {
  data: DayData[]
  currency: string
}

export function RevenueChart({ data, currency }: Props) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const hasData = data.some((d) => d.revenue > 0)

  return (
    <div>
      {/* Bar chart */}
      <div className="flex items-end gap-2 h-36">
        {data.map((day, i) => {
          const heightPct = (day.revenue / maxRevenue) * 100
          const isToday = i === data.length - 1
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              {day.revenue > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatCurrency(day.revenue, currency)}
                  <br />
                  <span className="text-gray-400">{day.count} order{day.count !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Bar */}
              <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isToday
                      ? 'bg-indigo-600'
                      : day.revenue > 0
                        ? 'bg-indigo-300 group-hover:bg-indigo-400'
                        : 'bg-gray-100'
                  }`}
                  style={{ height: `${Math.max(heightPct, day.revenue > 0 ? 4 : 2)}%` }}
                />
              </div>

              {/* Day label */}
              <span className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                {day.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* No data message */}
      {!hasData && (
        <p className="text-center text-xs text-gray-400 mt-2">No orders in the last 7 days</p>
      )}

      {/* X-axis summary */}
      {hasData && (
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {data.filter((d) => d.count > 0).length} active days
          </span>
          <span className="text-xs text-gray-400">
            {data.reduce((s, d) => s + d.count, 0)} orders total
          </span>
        </div>
      )}
    </div>
  )
}
