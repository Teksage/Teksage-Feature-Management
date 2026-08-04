'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import type { IFeatureEntity, IFeatureFilters } from './features.types'

export function useGetFeatures(filters?: IFeatureFilters) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [QUERY_KEYS.features, filters],
    queryFn: async (): Promise<IFeatureEntity[]> => {
      const supabase = getSupabaseBrowserClient()

      let query = supabase
        .from('features')
        .select('*, feature_categories(name), profiles!created_by(full_name)')
        .order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.priority) query = query.eq('priority', filters.priority)
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`)

      const { data: rows, error } = await query
      if (error) throw error

      const ids = (rows ?? []).map((r) => r.id)
      const { data: votes } = ids.length
        ? await supabase.from('feature_votes').select('feature_id, user_id').in('feature_id', ids)
        : { data: [] }

      const voteCounts: Record<string, number> = {}
      const userVoted = new Set<string>()
      for (const v of votes ?? []) {
        voteCounts[v.feature_id] = (voteCounts[v.feature_id] ?? 0) + 1
        if (v.user_id === user?.id) userVoted.add(v.feature_id)
      }

      return (rows ?? []).map((r) => ({
        ...r,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category_name: (r.feature_categories as any)?.name ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        creator_full_name: (r.profiles as any)?.full_name ?? null,
        vote_count: voteCounts[r.id] ?? 0,
        has_voted: userVoted.has(r.id),
      }))
    },
    staleTime: STALE_TIME.short,
  })
}
