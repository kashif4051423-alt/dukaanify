'use client'

import { useEffect, useState } from 'react'

interface AdminKPICardProps {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  accent: 'indigo' | 'violet' | 'amber' | 'emerald'
  delay: number
}

export function AdminKPICard({
  label,
  value,
  sub,
  icon,
  accent,
  delay,
}: AdminKPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay * 100)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!isVisible || typeof value !== 'number') return

    let current = 0
    const target = value
    const increment = target / 30

    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setDisplayValue(target)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isVisible, value])

  const colors = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      val: 'text-indigo-300',
      glow: 'shadow-lg shadow-indigo-500/10',
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
      val: 'text-violet-300',
      glow: 'shadow-lg shadow-violet-500/10',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      val: 'text-amber-300',
      glow: 'shadow-lg shadow-amber-500/10',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      val: 'text-emerald-300',
      glow: 'shadow-lg shadow-emerald-500/10',
    },
  }

  const c = colors[accent]

  return (
    <style>{`
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .kpi-card {
        animation: slideInUp 0.6s ease-out forwards;
      }
    `}
      <div
        className={`bg-slate-900/50 backdrop-blur border ${c.border} rounded-2xl p-6 ${c.glow} hover:border-opacity-100 transition-all duration-300 kpi-card`}
        style={{
          animationDelay: `${delay * 100}ms`,
        }}
      >
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4 ${c.text}`}>
          {icon}
        </div>
        <p className={`text-3xl font-bold ${c.val}`}>
          {typeof value === 'number' ? displayValue : value}
        </p>
        <p className="text-sm text-slate-400 mt-1 font-medium">{label}</p>
        <p className="text-xs text-slate-600 mt-1">{sub}</p>
      </div>
    </style>
  )
}
