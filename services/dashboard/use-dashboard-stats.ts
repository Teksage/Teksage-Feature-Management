'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { daysUntil } from '@/utils/format'
import type { IFeatureEntity } from '@/services/features/features.types'

export interface IDashboardStats {
  totalFeatures: number
  byStatus: Record<string, number>
  overdueCount: number
  allFeatures: IFeatureEntity[]
  topVoted: IFeatureEntity[]
  recentFeatures: IFeatureEntity[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboardStats],
    queryFn: async (): Promise<IDashboardStats> => {
      const supabase = getSupabaseBrowserClient()

      const { data: features, error } = await supabase
        .from('features')
        .select('*, feature_categories(name), profiles!created_by(full_name)')
        .order('created_at', { ascending: false })
      if (error) throw error

      const ids = (features ?? []).map((f) => f.id)
      const { data: votes, error: votesError } = ids.length
        ? await supabase.from('feature_votes').select('feature_id, user_id').in('feature_id', ids)
        : { data: [], error: null }
      if (votesError) throw votesError

      const voteCounts: Record<string, number> = {}
      for (const v of votes ?? []) {
        voteCounts[v.feature_id] = (voteCounts[v.feature_id] ?? 0) + 1
      }

      const enriched: IFeatureEntity[] = (features ?? []).map((f) => ({
        ...f,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category_name: (f.feature_categories as any)?.name ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        creator_full_name: (f.profiles as any)?.full_name ?? null,
        vote_count: voteCounts[f.id] ?? 0,
        has_voted: false,
      }))

      const byStatus: Record<string, number> = {}
      for (const f of enriched) {
        byStatus[f.status] = (byStatus[f.status] ?? 0) + 1
      }

      const overdueCount = enriched.filter((f) => {
        if (!f.target_release || f.status === 'Completed') return false
        const days = daysUntil(f.target_release)
        return days !== null && days < 0
      }).length

      return {
        totalFeatures: enriched.length,
        byStatus,
        overdueCount,
        allFeatures: enriched,
        topVoted: [...enriched].sort((a, b) => b.vote_count - a.vote_count).slice(0, 5),
        recentFeatures: enriched.slice(0, 5),
      }
    },
    staleTime: STALE_TIME.short,
  })
}
