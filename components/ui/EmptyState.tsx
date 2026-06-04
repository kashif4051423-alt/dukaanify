import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#1f2937] flex items-center justify-center mb-4">
          <span className="text-[#6b7280]">{icon}</span>
        </div>
      )}
      <p className="font-semibold text-[#9ca3af]">{title}</p>
      {description && <p className="text-sm text-[#6b7280] mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
