'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import { FEATURE_SELECT, mapFeatureRow } from './map-feature'
import type { IFeatureEntity, IFeatureFilters } from './features.types'

function buildSubtaskCounts(rows: { feature_id: string; is_done: boolean }[]) {
  const totals: Record<string, number> = {}
  const done: Record<string, number> = {}
  for (const r of rows) {
    totals[r.feature_id] = (totals[r.feature_id] ?? 0) + 1
    if (r.is_done) done[r.feature_id] = (done[r.feature_id] ?? 0) + 1
  }
  return { totals, done }
}

export function useGetFeatures(filters?: IFeatureFilters) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [QUERY_KEYS.features, filters],
    queryFn: async (): Promise<IFeatureEntity[]> => {
      const supabase = getSupabaseBrowserClient()

      let query = supabase
        .from('features')
        .select(FEATURE_SELECT)
        .order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.priority) query = query.eq('priority', filters.priority)
      if (filters?.platform) query = query.eq('platform', filters.platform)
      if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
      if (filters?.assigneeId) query = query.eq('assignee_id', filters.assigneeId)
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`)

      const { data: rows, error } = await query
      if (error) throw error

      const ids = (rows ?? []).map((r) => r.id)
      const [{ data: votes }, { data: subtasks }] = await Promise.all([
        ids.length
          ? supabase.from('feature_votes').select('feature_id, user_id').in('feature_id', ids)
          : Promise.resolve({ data: [] as { feature_id: string; user_id: string }[] }),
        ids.length
          ? supabase.from('feature_subtasks').select('feature_id, is_done').in('feature_id', ids)
          : Promise.resolve({ data: [] as { feature_id: string; is_done: boolean }[] }),
      ])

      const voteCounts: Record<string, number> = {}
      const userVoted = new Set<string>()
      for (const v of votes ?? []) {
        voteCounts[v.feature_id] = (voteCounts[v.feature_id] ?? 0) + 1
        if (v.user_id === user?.id) userVoted.add(v.feature_id)
      }

      const { totals, done } = buildSubtaskCounts(subtasks ?? [])

      return (rows ?? []).map((r) =>
        mapFeatureRow(
          r as Parameters<typeof mapFeatureRow>[0],
          voteCounts[r.id] ?? 0,
          userVoted.has(r.id),
          done[r.id] ?? 0,
          totals[r.id] ?? 0
        )
      )
    },
    staleTime: STALE_TIME.short,
  })
}
