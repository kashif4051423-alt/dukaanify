import type { OrderStatus } from '@/types/models'

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; dot: string }
> = {
  pending:    { label: 'Pending',    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-400' },
  confirmed:  { label: 'Confirmed',  className: 'bg-blue-50   text-blue-700   border-blue-200',    dot: 'bg-blue-400' },
  processing: { label: 'Processing', className: 'bg-indigo-50 text-indigo-700 border-indigo-200',  dot: 'bg-indigo-400' },
  shipped:    { label: 'Shipped',    className: 'bg-purple-50 text-purple-700 border-purple-200',  dot: 'bg-purple-400' },
  delivered:  { label: 'Delivered',  className: 'bg-green-50  text-green-700  border-green-200',   dot: 'bg-green-500' },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-50    text-red-700    border-red-200',     dot: 'bg-red-400' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
