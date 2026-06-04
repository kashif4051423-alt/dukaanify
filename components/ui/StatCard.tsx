import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  iconBg?: string
  iconColor?: string
  href?: string
  className?: string
}

export function StatCard({ label, value, sub, icon, iconBg = 'bg-purple-900/30', iconColor = 'text-purple-400', className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-[#111827] border border-[#1f2937] rounded-xl p-5',
      'shadow-[0_1px_3px_0_rgb(0_0_0/0.3),0_1px_2px_-1px_rgb(0_0_0/0.2)]',
      'hover:border-[#7c3aed]/50 transition-all duration-200',
      className
    )}>
      {icon && (
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
      )}
      <p className="text-2xl font-bold text-[#f9fafb] leading-none">{value}</p>
      <p className="text-sm text-[#9ca3af] mt-1">{label}</p>
      {sub && <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>}
    </div>
  )
}
