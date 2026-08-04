'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import type { IFeatureEntity } from './features.types'

export function useGetFeature(id: string) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [QUERY_KEYS.feature, id],
    queryFn: async (): Promise<IFeatureEntity | null> => {
      const supabase = getSupabaseBrowserClient()

      const { data: row, error } = await supabase
        .from('features')
        .select('*, feature_categories(name), profiles!created_by(full_name)')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!row) return null

      const { data: votes } = await supabase
        .from('feature_votes')
        .select('user_id')
        .eq('feature_id', id)

      const voteCount = votes?.length ?? 0
      const hasVoted = votes?.some((v) => v.user_id === user?.id) ?? false

      return {
        ...row,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category_name: (row.feature_categories as any)?.name ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        creator_full_name: (row.profiles as any)?.full_name ?? null,
        vote_count: voteCount,
        has_voted: hasVoted,
      }
    },
    enabled: !!id,
    staleTime: STALE_TIME.short,
  })
}
