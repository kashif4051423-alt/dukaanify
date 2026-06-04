'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { STATUS_CONFIG } from './StatusBadge'
import type { OrderStatus } from '@/types/models'

const FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function OrderFilters({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? 'all'

  const setFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all') params.delete('status')
      else params.set('status', value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTER_OPTIONS.map(({ value, label }) => {
        const isActive = current === value
        const dot = value !== 'all' ? STATUS_CONFIG[value as OrderStatus]?.dot : null
        return (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {dot && (
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/70' : dot}`} />
            )}
            {label}
            {value === 'all' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {total}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
