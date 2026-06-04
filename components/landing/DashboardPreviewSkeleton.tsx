'use client'

import { useEffect, useState } from 'react'

export function DashboardPreviewSkeleton() {
  const [isLoading, setIsLoading] = useState(true)
  const [animateStats, setAnimateStats] = useState(false)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setAnimateStats(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(31, 41, 55, 0.5) 0%,
            rgba(55, 65, 81, 0.5) 50%,
            rgba(31, 41, 55, 0.5) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .stat-value {
          animation: slideUp 0.6s ease-out forwards;
        }

        .stat-value:nth-child(1) { animation-delay: 0.1s; }
        .stat-value:nth-child(2) { animation-delay: 0.2s; }
        .stat-value:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      <div className="relative bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-2xl p-px shadow-2xl shadow-purple-900/30">
        <div className="bg-[#111827] rounded-2xl overflow-hidden">
          {/* Browser bar */}
          <div className="bg-[#0B0F19] border-b border-[#1F2937] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-[#1F2937] rounded-md h-5 mx-4 flex items-center px-3">
              <span className="text-xs text-[#9CA3AF]">dukaanify.com/dashboard</span>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="p-5 bg-[#0B0F19] space-y-3">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Orders', value: '1,284', color: 'text-[#A78BFA]' },
                { label: 'Revenue', value: 'PKR 84K', color: 'text-[#34D399]' },
                { label: 'Products', value: '56', color: 'text-[#22D3EE]' },
              ].map((s, idx) => (
                <div
                  key={s.label}
                  className="bg-[#111827] rounded-xl p-3 border border-[#1F2937] stat-value"
                  style={{
                    animationDelay: animateStats ? `${idx * 0.1}s` : '0s',
                  }}
                >
                  <p className="text-xs text-[#9CA3AF] mb-1">{s.label}</p>
                  {isLoading ? (
                    <div className="skeleton h-6 w-20 rounded" />
                  ) : (
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-[#111827] rounded-xl p-4 border border-[#1F2937]">
              <p className="text-xs font-semibold text-[#F9FAFB] mb-3">Recent Orders</p>
              <div className="space-y-2.5">
                {[
                  { name: 'Ali Hassan', amount: 'PKR 2,400', status: 'Delivered', color: 'bg-emerald-900/40 text-emerald-400' },
                  { name: 'Sara Khan', amount: 'PKR 1,800', status: 'Pending', color: 'bg-yellow-900/40 text-yellow-400' },
                  { name: 'Usman Raza', amount: 'PKR 3,200', status: 'Processing', color: 'bg-purple-900/40 text-purple-400' },
                ].map((o, idx) => (
                  <div
                    key={o.name}
                    className="flex items-center justify-between text-xs stat-value"
                    style={{
                      animationDelay: animateStats ? `${0.3 + idx * 0.1}s` : '0s',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="skeleton h-4 w-24 rounded" />
                        <div className="skeleton h-4 w-20 rounded" />
                        <div className="skeleton h-4 w-16 rounded" />
                      </>
                    ) : (
                      <>
                        <span className="text-[#F9FAFB] font-medium">{o.name}</span>
                        <span className="text-[#9CA3AF]">{o.amount}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.color}`}>
                          {o.status}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="absolute -bottom-4 -left-4 bg-[#111827] border border-[#1F2937] rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 stat-value"
        style={{
          animationDelay: animateStats ? '0.6s' : '0s',
        }}
      >
        <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-[#9CA3AF]">This month</p>
          {isLoading ? (
            <div className="skeleton h-5 w-24 rounded mt-1" />
          ) : (
            <p className="text-sm font-bold text-[#F9FAFB]">+32% Revenue</p>
          )}
        </div>
      </div>
    </div>
  )
}
