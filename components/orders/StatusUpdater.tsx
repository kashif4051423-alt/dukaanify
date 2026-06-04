'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { updateOrderStatus } from '@/lib/actions/order'
import { StatusBadge, STATUS_CONFIG } from './StatusBadge'
import type { OrderStatus } from '@/types/models'

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
]

interface Props {
  orderId: string
  currentStatus: OrderStatus
  businessSlug: string
}

export function StatusUpdater({ orderId, currentStatus, businessSlug }: Props) {
  const [open, setOpen] = useState(false)
  const [optimistic, setOptimistic] = useState<OrderStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSelect(status: OrderStatus) {
    if (status === optimistic) { setOpen(false); return }
    setOpen(false)
    setError(null)
    const prev = optimistic
    setOptimistic(status) // optimistic update

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status, businessSlug)
      if (result.error) {
        setOptimistic(prev) // revert
        setError(result.error)
      }
    })
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="flex items-center gap-1.5 disabled:opacity-60 transition-opacity"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <StatusBadge status={optimistic} />
        <ChevronIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-600 whitespace-nowrap bg-white border border-red-200 rounded-lg px-2 py-1 shadow-sm z-10">
          {error}
        </p>
      )}

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[160px]"
        >
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s]
            const isActive = s === optimistic
            return (
              <button
                key={s}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(s)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                  isActive ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <span className="text-gray-700">{cfg.label}</span>
                {isActive && <CheckIcon className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}
