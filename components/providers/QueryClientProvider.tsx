'use client'

import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import type { ReactNode } from 'react'

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  )
}
