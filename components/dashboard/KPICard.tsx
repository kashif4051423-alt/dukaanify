'use client'

interface Props {
  label: string
  value: string
  subtext?: string
  positive?: boolean
}

export function KPICard({ label, value, subtext, positive }: Props) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border ${positive ? 'border-emerald-100' : 'border-gray-100'}`}>
      <p className={`text-sm font-medium ${positive ? 'text-emerald-600' : 'text-gray-600'}`}>
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  )
}
