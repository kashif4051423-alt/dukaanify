import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'default' | 'purple' | 'emerald' | 'yellow' | 'red' | 'blue' | 'orange' | 'gray'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#1f2937] text-[#9ca3af] border-[#374151]',
  purple:  'bg-purple-900/30 text-purple-300 border-purple-800/50',
  emerald: 'bg-emerald-900/30 text-emerald-300 border-emerald-800/50',
  yellow:  'bg-yellow-900/30 text-yellow-300 border-yellow-800/50',
  red:     'bg-red-900/30 text-red-300 border-red-800/50',
  blue:    'bg-blue-900/30 text-blue-300 border-blue-800/50',
  orange:  'bg-orange-900/30 text-orange-300 border-orange-800/50',
  gray:    'bg-[#1f2937] text-[#9ca3af] border-[#374151]',
}

interface BadgeProps {
  variant?: BadgeVariant
  dot?: boolean
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', dot = false, className, children }: BadgeProps) {
  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-[#6b7280]',
    purple:  'bg-purple-400',
    emerald: 'bg-emerald-400',
    yellow:  'bg-yellow-400',
    red:     'bg-red-400',
    blue:    'bg-blue-400',
    orange:  'bg-orange-400',
    gray:    'bg-[#6b7280]',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      variantClasses[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}
