'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types/models'

export function useBusinesses(userId: string | undefined) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)           // tenant isolation — only owner's businesses
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBusinesses(data ?? [])
        setLoading(false)
      })
  }, [userId])

  return { businesses, loading }
}
