'use client'

import { useEffect, useState } from 'react'

interface DashboardData {
  totalOrders: number
  revenue: number
  products: number
  activeUsers: number
  conversionRate: number
  avgOrderValue: number
  recentOrders: Array<{
    id: string
    customer: string
    amount: number
    status: 'delivered' | 'pending' | 'processing' | 'cancelled'
    time: string
  }>
  topProducts: Array<{
    name: string
    sales: number
    trend: number
  }>
  chartData: Array<{
    time: string
    sales: number
    orders: number
  }>
}

const generateRandomData = (): DashboardData => {
  const statuses: Array<'delivered' | 'pending' | 'processing' | 'cancelled'> = [
    'delivered',
    'pending',
    'processing',
    'cancelled',
  ]
  const customers = [
    'Ali Hassan',
    'Sara Khan',
    'Usman Raza',
    'Fatima Ahmed',
    'Hassan Ali',
    'Zainab Khan',
  ]
  const products = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Monitor', 'Keyboard']

  return {
    totalOrders: Math.floor(Math.random() * 5000) + 1000,
    revenue: Math.floor(Math.random() * 500000) + 100000,
    products: Math.floor(Math.random() * 200) + 50,
    activeUsers: Math.floor(Math.random() * 1000) + 200,
    conversionRate: parseFloat((Math.random() * 5 + 2).toFixed(2)),
    avgOrderValue: Math.floor(Math.random() * 10000) + 2000,
    recentOrders: Array.from({ length: 8 }, (_, i) => ({
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      amount: Math.floor(Math.random() * 50000) + 1000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      time: `${Math.floor(Math.random() * 60)}m ago`,
    })),
    topProducts: products.map((p) => ({
      name: p,
      sales: Math.floor(Math.random() * 500) + 50,
      trend: Math.floor(Math.random() * 40) - 20,
    })),
    chartData: Array.from({ length: 12 }, (_, i) => ({
      time: `${i}:00`,
      sales: Math.floor(Math.random() * 100000) + 20000,
      orders: Math.floor(Math.random() * 100) + 20,
    })),
  }
}

export function ProfessionalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate data only on client side
    setData(generateRandomData())
    setIsLoading(false)

    // Update data every 3 seconds
    const interval = setInterval(() => {
      setData(generateRandomData())
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-900/40 text-emerald-400'
      case 'pending':
        return 'bg-yellow-900/40 text-yellow-400'
      case 'processing':
        return 'bg-blue-900/40 text-blue-400'
      case 'cancelled':
        return 'bg-red-900/40 text-red-400'
      default:
        return 'bg-gray-900/40 text-gray-400'
    }
  }

  const maxChartValue = data ? Math.max(...data.chartData.map((d) => d.sales)) : 0

  if (!data) {
    return (
      <div className="relative bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-2xl p-px shadow-2xl shadow-purple-900/30">
        <div className="bg-[#0B0F19] rounded-2xl overflow-hidden h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[#9CA3AF] text-sm">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
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

        .animate-in {
          animation: slideIn 0.4s ease-out;
        }

        .stat-card {
          animation: slideIn 0.5s ease-out;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        .stat-card:nth-child(5) { animation-delay: 0.5s; }
        .stat-card:nth-child(6) { animation-delay: 0.6s; }

        .order-row {
          animation: slideIn 0.4s ease-out;
        }

        .chart-bar {
          animation: slideIn 0.3s ease-out;
          transition: all 0.3s ease;
        }

        .chart-bar:hover {
          opacity: 0.8;
        }
      `}</style>

      <div className="relative bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-2xl p-px shadow-2xl shadow-purple-900/30">
        <div className="bg-[#0B0F19] rounded-2xl overflow-hidden">
          {/* Browser bar */}
          <div className="bg-[#111827] border-b border-[#1F2937] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-[#1F2937] rounded-md h-5 mx-4 flex items-center px-3">
              <span className="text-xs text-[#9CA3AF]">dukaanify.com/dashboard</span>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6 bg-[#0B0F19] space-y-6 max-h-96 overflow-y-auto">
            {/* Top Stats - 6 columns */}
            <div className="grid grid-cols-6 gap-2">
              {[
                { label: 'Orders', value: data.totalOrders, color: 'text-[#A78BFA]', icon: '📦' },
                { label: 'Revenue', value: `PKR ${(data.revenue / 1000).toFixed(0)}K`, color: 'text-[#34D399]', icon: '💰' },
                { label: 'Products', value: data.products, color: 'text-[#22D3EE]', icon: '🛍️' },
                { label: 'Users', value: data.activeUsers, color: 'text-[#FBBF24]', icon: '👥' },
                { label: 'Conv.', value: `${data.conversionRate}%`, color: 'text-[#F87171]', icon: '📈' },
                { label: 'Avg Order', value: `PKR ${(data.avgOrderValue / 1000).toFixed(1)}K`, color: 'text-[#A78BFA]', icon: '💳' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="stat-card bg-gradient-to-br from-[#111827] to-[#0B0F19] rounded-lg p-3 border border-[#1F2937] hover:border-[#7C3AED]/50 transition-all"
                >
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <p className="text-xs text-[#9CA3AF] mb-1">{stat.label}</p>
                  <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Chart and Orders Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Mini Chart */}
              <div className="bg-[#111827] rounded-lg p-3 border border-[#1F2937]">
                <p className="text-xs font-semibold text-[#F9FAFB] mb-3">Sales Trend (24h)</p>
                <div className="flex items-end gap-1 h-20">
                  {data.chartData.map((d, idx) => (
                    <div
                      key={idx}
                      className="chart-bar flex-1 bg-gradient-to-t from-[#7C3AED] to-[#A78BFA] rounded-t opacity-70 hover:opacity-100 relative group"
                      style={{
                        height: `${(d.sales / maxChartValue) * 100}%`,
                        animationDelay: `${idx * 0.05}s`,
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1F2937] px-2 py-1 rounded text-xs text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        PKR {(d.sales / 1000).toFixed(0)}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-[#111827] rounded-lg p-3 border border-[#1F2937]">
                <p className="text-xs font-semibold text-[#F9FAFB] mb-3">Top Products</p>
                <div className="space-y-2">
                  {data.topProducts.slice(0, 4).map((p, idx) => (
                    <div key={idx} className="order-row flex items-center justify-between text-xs">
                      <span className="text-[#9CA3AF] truncate">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#F9FAFB] font-semibold">{p.sales}</span>
                        <span className={p.trend > 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {p.trend > 0 ? '↑' : '↓'} {Math.abs(p.trend)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-[#111827] rounded-lg p-3 border border-[#1F2937]">
              <p className="text-xs font-semibold text-[#F9FAFB] mb-3">Recent Orders</p>
              <div className="space-y-2">
                {data.recentOrders.slice(0, 4).map((order, idx) => (
                  <div key={idx} className="order-row flex items-center justify-between text-xs">
                    <div className="flex-1">
                      <p className="text-[#F9FAFB] font-medium">{order.customer}</p>
                      <p className="text-[#9CA3AF] text-xs">{order.id}</p>
                    </div>
                    <span className="text-[#9CA3AF] font-semibold">PKR {(order.amount / 1000).toFixed(1)}K</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-2 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stats badge */}
      <div className="absolute -bottom-6 -left-6 bg-[#111827] border border-[#1F2937] rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 animate-in">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-[#9CA3AF]">Live Updates</p>
          <p className="text-sm font-bold text-[#F9FAFB]">+{Math.floor(Math.random() * 50) + 10}% This Week</p>
        </div>
      </div>
    </div>
  )
}
