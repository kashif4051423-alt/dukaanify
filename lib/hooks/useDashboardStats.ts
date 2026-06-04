'use client'

import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
  productCount: number
  activeProductCount: number
  orderCount: number
  customerCount: number
  totalRevenue: number
  deliveredRevenue: number
  pendingRevenue: number
  topProducts: Array<{ name: string; quantity: number }>
  last7DaysRevenue: Array<{ date: string; revenue: number }>
  statusCounts: Record<string, number>
}

async function fetchDashboardStats(businessSlug: string): Promise<DashboardStats> {
  const response = await fetch(`/api/dashboard/stats?slug=${businessSlug}`)
  if (!response.ok) throw new Error('Failed to fetch dashboard stats')
  return response.json()
}

export function useDashboardStats(businessSlug: string) {
  return useQuery({
    queryKey: ['dashboard-stats', businessSlug],
    queryFn: () => fetchDashboardStats(businessSlug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
