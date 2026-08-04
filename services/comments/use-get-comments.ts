'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

export interface IComment {
  id: string
  feature_id: string
  user_id: string
  body: string
  created_at: string
  author_name: string
}

export function useGetComments(featureId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.comments, featureId],
    queryFn: async (): Promise<IComment[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('feature_comments')
        .select('*, profiles(full_name)')
        .eq('feature_id', featureId)
        .order('created_at', { ascending: true })
      if (error) throw error

      return (data ?? []).map((c) => ({
        ...c,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        author_name: (c.profiles as any)?.full_name ?? 'Unknown',
      }))
    },
    enabled: !!featureId,
    staleTime: STALE_TIME.short,
  })
}
