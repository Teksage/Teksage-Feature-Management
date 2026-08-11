'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import { FEATURE_SELECT, mapFeatureRow } from './map-feature'
import type { IFeatureEntity } from './features.types'

export function useGetFeature(id: string) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [QUERY_KEYS.feature, id],
    queryFn: async (): Promise<IFeatureEntity | null> => {
      const supabase = getSupabaseBrowserClient()

      const { data: row, error } = await supabase
        .from('features')
        .select(FEATURE_SELECT)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!row) return null

      const [{ data: votes }, { data: subtasks }] = await Promise.all([
        supabase.from('feature_votes').select('user_id').eq('feature_id', id),
        supabase.from('feature_subtasks').select('is_done').eq('feature_id', id),
      ])

      const voteCount = votes?.length ?? 0
      const hasVoted = votes?.some((v) => v.user_id === user?.id) ?? false
      const subtaskTotal = subtasks?.length ?? 0
      const subtaskDone = subtasks?.filter((s) => s.is_done).length ?? 0

      return mapFeatureRow(
        row as Parameters<typeof mapFeatureRow>[0],
        voteCount,
        hasVoted,
        subtaskDone,
        subtaskTotal
      )
    },
    enabled: !!id,
    staleTime: STALE_TIME.short,
  })
}
