'use client'

import { useEffect, useState } from 'react'

interface AdminStats {
  totalClients: number
  totalBusinesses: number
  totalOrders: number
  totalRevenue: number
  activeStores: number
  pendingPayments: number
  clients: Array<{
    name: string
    email: string
    businesses: number
    joined: string
  }>
  businesses: Array<{
    name: string
    owner: string
    orders: number
    revenue: number
    status: 'active' | 'inactive'
  }>
}

const generateAdminData = (): AdminStats => {
  const clientNames = ['Kashif Ali', 'Ahmed Khan', 'Fatima Ahmed', 'Hassan Raza', 'Sara Khan']
  const businessNames = ['AvantCore', 'Pizza Hut', 'Tech Store', 'Fashion Hub', 'Electronics Plus']

  return {
    totalClients: Math.floor(Math.random() * 500) + 100,
    totalBusinesses: Math.floor(Math.random() * 1000) + 200,
    totalOrders: Math.floor(Math.random() * 50000) + 10000,
    totalRevenue: Math.floor(Math.random() * 10000000) + 1000000,
    activeStores: Math.floor(Math.random() * 800) + 150,
    pendingPayments: Math.floor(Math.random() * 50) + 5,
    clients: clientNames.map((name) => ({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
      businesses: Math.floor(Math.random() * 5) + 1,
      joined: `${Math.floor(Math.random() * 12) + 1} months ago`,
    })),
    businesses: businessNames.map((name) => ({
      name,
      owner: clientNames[Math.floor(Math.random() * clientNames.length)],
      orders: Math.floor(Math.random() * 500) + 50,
      revenue: Math.floor(Math.random() * 5000000) + 100000,
      status: Math.random() > 0.3 ? 'active' : 'inactive',
    })),
  }
}

export function Admin3DPanel() {
  const [data, setData] = useState<AdminStats>(generateAdminData())

  useEffect(() => {
    // Update data every 5 seconds instead of 2 (reduces re-renders by 60%)
    const interval = setInterval(() => {
      setData(generateAdminData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.6); }
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

        .row-item {
          animation: slideIn 0.4s ease-out;
        }

        .glow-card {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>

      <div className="relative bg-gradient-to-br from-[#7C3AED] via-[#06B6D4] to-[#7C3AED] rounded-3xl p-px shadow-2xl shadow-purple-900/50">
        <div className="bg-[#0B0F19] rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#111827] to-[#1F2937] border-b border-[#1F2937] px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#F9FAFB]">Platform Overview</h2>
                <p className="text-sm text-[#9CA3AF] mt-1">Real-time data across all stores</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-500/50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400">Live</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8 max-h-96 overflow-y-auto">
            {/* 6 Key Metrics */}
            <div className="grid grid-cols-6 gap-3">
              {[
                { label: 'Total Clients', value: data.totalClients, icon: '👥', color: 'from-purple-600 to-purple-400' },
                { label: 'Businesses', value: data.totalBusinesses, icon: '🏢', color: 'from-cyan-600 to-cyan-400' },
                { label: 'Total Orders', value: data.totalOrders, icon: '📦', color: 'from-emerald-600 to-emerald-400' },
                { label: 'Revenue', value: `PKR ${(data.totalRevenue / 1000000).toFixed(1)}M`, icon: '💰', color: 'from-yellow-600 to-yellow-400' },
                { label: 'Active Stores', value: data.activeStores, icon: '🏪', color: 'from-pink-600 to-pink-400' },
                { label: 'Pending', value: data.pendingPayments, icon: '⏳', color: 'from-orange-600 to-orange-400' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`stat-card bg-gradient-to-br ${stat.color} p-px rounded-xl`}
                >
                  <div className="bg-[#111827] rounded-xl p-4 h-full">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <p className="text-xs text-[#9CA3AF] mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-[#F9FAFB]">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Clients Section */}
            <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-4">
              <h3 className="text-sm font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
                <span>👥 Clients</span>
                <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full">{data.clients.length}</span>
              </h3>
              <div className="space-y-2">
                {data.clients.map((client, idx) => (
                  <div key={idx} className="row-item flex items-center justify-between text-xs p-2 hover:bg-[#1F2937] rounded transition-colors">
                    <div className="flex-1">
                      <p className="text-[#F9FAFB] font-semibold">{client.name}</p>
                      <p className="text-[#9CA3AF]">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#A78BFA] font-semibold">{client.businesses} businesses</p>
                      <p className="text-[#9CA3AF]">{client.joined}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Businesses Section */}
            <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-4">
              <h3 className="text-sm font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
                <span>🏢 Businesses</span>
                <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded-full">{data.businesses.length}</span>
              </h3>
              <div className="space-y-2">
                {data.businesses.map((business, idx) => (
                  <div key={idx} className="row-item flex items-center justify-between text-xs p-2 hover:bg-[#1F2937] rounded transition-colors">
                    <div className="flex-1">
                      <p className="text-[#F9FAFB] font-semibold">{business.name}</p>
                      <p className="text-[#9CA3AF]">Owner: {business.owner}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-[#22D3EE] font-semibold">{business.orders} orders</p>
                        <p className="text-[#34D399]">PKR {(business.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        business.status === 'active'
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}>
                        {business.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] p-px rounded-2xl shadow-2xl shadow-purple-900/50 glow-card">
        <div className="bg-[#111827] rounded-2xl px-6 py-4">
          <p className="text-xs text-[#9CA3AF] mb-1">Platform Status</p>
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#22D3EE]">
            All Systems Operational
          </p>
        </div>
      </div>
    </div>
  )
}
