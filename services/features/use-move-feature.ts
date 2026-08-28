'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateFeatures, invalidateActivity } from '@/lib/invalidate-queries'
import { QUERY_KEYS, type FeatureBoardTab } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import type { FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from './features.types'

interface MovePayload {
  id: string
  status: FeatureStatus
  tab?: FeatureBoardTab
  singleBoard?: boolean
}

function movePatch(status: FeatureStatus, tab?: FeatureBoardTab, singleBoard?: boolean) {
  if (singleBoard) return { status, web_status: status, app_status: status }
  return tab === 'App' ? { status, app_status: status } : { status, web_status: status }
}

export function useMoveFeature() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, status, tab, singleBoard }: MovePayload) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from('features')
        .update(movePatch(status, tab, singleBoard))
        .eq('id', id)
        .select('id')

      if (error) throw error
      if (!data?.length) throw new Error('You do not have permission to move this feature.')
    },
    onMutate: ({ id, status, tab, singleBoard }) => {
      const previous = queryClient.getQueriesData<IFeatureEntity[]>({
        queryKey: [QUERY_KEYS.features],
      })

      queryClient.setQueriesData<IFeatureEntity[]>({ queryKey: [QUERY_KEYS.features] }, (old) =>
        old?.map((f) => (f.id === id ? { ...f, ...movePatch(status, tab, singleBoard) } : f))
      )

      return { previous }
    },
    onError: (err: Error, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(err.message || 'Failed to move feature.')
    },
    onSettled: (_data, _err, vars) => {
      invalidateFeatures(queryClient)
      invalidateActivity(queryClient, vars.id)
    },
  })
}
