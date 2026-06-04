import { cn } from '@/lib/utils/cn'

type AlertVariant = 'error' | 'warning' | 'success' | 'info'

const styles: Record<AlertVariant, { wrapper: string; icon: React.ReactNode }> = {
  error: {
    wrapper: 'bg-red-900/20 border-red-800/50 text-red-300',
    icon: (
      <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  warning: {
    wrapper: 'bg-yellow-900/20 border-yellow-800/50 text-yellow-300',
    icon: (
      <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  success: {
    wrapper: 'bg-emerald-900/20 border-emerald-800/50 text-emerald-300',
    icon: (
      <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    wrapper: 'bg-purple-900/20 border-purple-800/50 text-purple-300',
    icon: (
      <svg className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

interface AlertProps {
  variant?: AlertVariant
  message: string
  className?: string
}

export function Alert({ variant = 'error', message, className }: AlertProps) {
  const { wrapper, icon } = styles[variant]
  return (
    <div className={cn('flex items-start gap-2.5 border rounded-xl px-4 py-3', wrapper, className)}>
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  )
}
