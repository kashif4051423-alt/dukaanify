'use client'

interface StatusCounts {
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

interface Props {
  counts: StatusCounts
  total: number
}

const STATUS_STYLES = [
  { key: 'delivered',  label: 'Delivered',  color: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50' },
  { key: 'pending',    label: 'Pending',    color: 'bg-yellow-400',  text: 'text-yellow-700',  light: 'bg-yellow-50' },
  { key: 'processing', label: 'Processing', color: 'bg-indigo-400',  text: 'text-indigo-700',  light: 'bg-indigo-50' },
  { key: 'shipped',    label: 'Shipped',    color: 'bg-purple-400',  text: 'text-purple-700',  light: 'bg-purple-50' },
  { key: 'confirmed',  label: 'Confirmed',  color: 'bg-blue-400',    text: 'text-blue-700',    light: 'bg-blue-50' },
  { key: 'cancelled',  label: 'Cancelled',  color: 'bg-red-400',     text: 'text-red-700',     light: 'bg-red-50' },
] as const

export function OrderStatusChart({ counts, total }: Props) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-gray-300">0</span>
        </div>
        <p className="text-sm text-gray-400">No orders yet</p>
      </div>
    )
  }

  // Build stacked bar segments
  const segments = STATUS_STYLES.map((s) => ({
    ...s,
    count: counts[s.key],
    pct: (counts[s.key] / total) * 100,
  })).filter((s) => s.count > 0)

  const deliveredPct = Math.round((counts.delivered / total) * 100)

  return (
    <div className="space-y-4">
      {/* Donut-style ring (CSS only) */}
      <div className="flex items-center justify-center">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
            {/* Segments */}
            {buildDonutSegments(segments, total)}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-400">orders</span>
          </div>
        </div>
      </div>

      {/* Completion rate */}
      <div className="text-center">
        <span className="text-sm font-semibold text-emerald-600">{deliveredPct}%</span>
        <span className="text-xs text-gray-400 ml-1">completion rate</span>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-xs text-gray-600">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-6 text-right">{s.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Build SVG donut segments from status data
function buildDonutSegments(
  segments: Array<{ color: string; pct: number }>,
  total: number
) {
  const circumference = 2 * Math.PI * 15.9
  const colorMap: Record<string, string> = {
    'bg-emerald-500': '#10b981',
    'bg-yellow-400':  '#facc15',
    'bg-indigo-400':  '#818cf8',
    'bg-purple-400':  '#c084fc',
    'bg-blue-400':    '#60a5fa',
    'bg-red-400':     '#f87171',
  }

  let offset = 0
  return segments.map((seg, i) => {
    const dash = (seg.pct / 100) * circumference
    const gap = circumference - dash
    const el = (
      <circle
        key={i}
        cx="18" cy="18" r="15.9"
        fill="none"
        stroke={colorMap[seg.color] ?? '#6366f1'}
        strokeWidth="3.5"
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
      />
    )
    offset += dash
    return el
  })
}
