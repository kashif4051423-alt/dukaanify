'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/format'

interface ChartData {
  label: string
  date: string
  revenue: number
  count: number
}

export function InteractiveRevenueChart({
  data,
  currency,
}: {
  data: ChartData[]
  currency: string
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  const selected = selectedDate ? data.find((d) => d.date === selectedDate) : data[data.length - 1]

  return (
    <div className="space-y-4">
      {/* Selected day info */}
      {selected && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium">{selected.label}, {selected.date}</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {formatCurrency(selected.revenue, currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700 font-medium">Orders</p>
              <p className="text-2xl font-bold text-emerald-900">{selected.count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bar chart */}
      <div className="space-y-2">
        {data.map((day) => {
          const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
          const isSelected = selectedDate === day.date || (!selectedDate && day === data[data.length - 1])

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date === selectedDate ? null : day.date)}
              className={`w-full text-left transition-all duration-200 cursor-pointer p-2 rounded-lg ${
                isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {day.label}
                  </p>
                  <p className={`text-xs ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {day.count} orders
                  </p>
                </div>
                <span className={`text-sm font-bold ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {formatCurrency(day.revenue, currency)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSelected ? 'bg-indigo-500' : day.revenue > 0 ? 'bg-emerald-400' : 'bg-gray-300'
                  }`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
