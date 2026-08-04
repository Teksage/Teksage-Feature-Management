'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

export interface ICategory {
  id: string
  name: string
  slug: string
  created_at: string
}

export function useGetCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: async (): Promise<ICategory[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('feature_categories')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: STALE_TIME.long,
  })
}
