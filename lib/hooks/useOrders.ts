'use client'

import { useQuery } from '@tanstack/react-query'
import type { Order } from '@/types/models'

export interface UseOrdersOptions {
  businessSlug?: string
  status?: string
  page?: number
  pageSize?: number
}

async function fetchOrders(businessSlug: string, status?: string, page: number = 1, pageSize: number = 20): Promise<{ orders: Order[]; total: number }> {
  const params = new URLSearchParams({
    slug: businessSlug,
    page: String(page),
    pageSize: String(pageSize),
  })
  if (status && status !== 'all') params.append('status', status)

  const response = await fetch(`/api/orders?${params}`)
  if (!response.ok) throw new Error('Failed to fetch orders')
  return response.json()
}

export function useOrders({ businessSlug, status, page = 1, pageSize = 20 }: UseOrdersOptions) {
  return useQuery({
    queryKey: ['orders', businessSlug, status, page, pageSize],
    queryFn: () => fetchOrders(businessSlug!, status, page, pageSize),
    enabled: !!businessSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
