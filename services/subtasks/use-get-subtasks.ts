'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { SubtaskStatus } from '@/types/supabase.types'

export interface ISubtask {
  id: string
  feature_id: string
  title: string
  status: SubtaskStatus
  is_done: boolean
  sort_order: number
  assignee_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  assignee_full_name: string | null
}

export function useGetSubtasks(featureId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.subtasks, featureId],
    queryFn: async (): Promise<ISubtask[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('feature_subtasks')
        .select('*, assignee:profiles!assignee_id(full_name)')
        .eq('feature_id', featureId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map((row) => ({
        ...row,
        status: (row.status ?? (row.is_done ? 'Completed' : 'Idea')) as SubtaskStatus,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignee_full_name: (row.assignee as any)?.full_name ?? null,
      }))
    },
    enabled: !!featureId,
    staleTime: STALE_TIME.short,
  })
}
