'use client'

import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/types/models'

export interface UseProductsOptions {
  businessId?: string
  page?: number
  pageSize?: number
  onlyActive?: boolean
}

async function fetchProducts(businessId: string, page: number = 1, pageSize: number = 12, onlyActive: boolean = true): Promise<{ products: Product[]; total: number }> {
  const response = await fetch(`/api/products?businessId=${businessId}&page=${page}&pageSize=${pageSize}&onlyActive=${onlyActive}`)
  if (!response.ok) throw new Error('Failed to fetch products')
  return response.json()
}

export function useProducts({ businessId, page = 1, pageSize = 12, onlyActive = true }: UseProductsOptions) {
  return useQuery({
    queryKey: ['products', businessId, page, pageSize, onlyActive],
    queryFn: () => fetchProducts(businessId!, page, pageSize, onlyActive),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
