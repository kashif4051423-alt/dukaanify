'use client'

import { useDashboardStats } from '@/lib/hooks/useDashboardStats'
import {
  DashboardKPIsSkeleton,
  ChartSkeleton,
  OrdersTableSkeleton,
} from '@/components/skeletons/DashboardSkeleton'
import { KPICard } from '@/components/dashboard/KPICard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { TopProductsCard } from '@/components/dashboard/TopProductsCard'
import { StatusBreakdownCard } from '@/components/dashboard/StatusBreakdownCard'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  businessSlug: string
  currency: string
}

export function DashboardContent({ businessSlug, currency }: Props) {
  const { data: stats, isLoading, error } = useDashboardStats(businessSlug)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard</p>
      </div>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <DashboardKPIsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <OrdersTableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue, currency)}
          subtext={`${stats.orderCount} orders`}
        />
        <KPICard
          label="Delivered Revenue"
          value={formatCurrency(stats.deliveredRevenue, currency)}
          subtext={`${stats.statusCounts.delivered} delivered`}
          positive
        />
        <KPICard
          label="Products"
          value={stats.activeProductCount.toString()}
          subtext={`${stats.productCount} total`}
        />
        <KPICard
          label="Customers"
          value={stats.customerCount.toString()}
          subtext="lifetime"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.last7DaysRevenue} currency={currency} />
        <StatusBreakdownCard statusCounts={stats.statusCounts} />
      </div>

      {/* Top Products */}
      <TopProductsCard products={stats.topProducts} currency={currency} />
    </div>
  )
}
