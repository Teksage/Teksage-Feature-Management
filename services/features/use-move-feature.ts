'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateFeatures } from '@/lib/invalidate-queries'
import { QUERY_KEYS, type FeatureBoardTab } from '@/lib/constants'
import type { FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from './features.types'

interface MovePayload {
  id: string
  status: FeatureStatus
  tab: FeatureBoardTab
}

/**
 * Only the dragged board's status column is written, so a `Both` feature can sit
 * in different columns on Web and App. `status` mirrors it for list/detail views.
 */
function movePatch(status: FeatureStatus, tab: FeatureBoardTab) {
  return tab === 'Web' ? { status, web_status: status } : { status, app_status: status }
}

export function useMoveFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, tab }: MovePayload) => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('features')
        .update(movePatch(status, tab))
        .eq('id', id)
        .select('id')

      if (error) throw error
      // RLS denials update zero rows without raising, which would silently
      // revert the card on the next refetch.
      if (!data?.length) throw new Error('You do not have permission to move this feature.')
    },
    onMutate: ({ id, status, tab }) => {
      const previous = queryClient.getQueriesData<IFeatureEntity[]>({
        queryKey: [QUERY_KEYS.features],
      })

      queryClient.setQueriesData<IFeatureEntity[]>({ queryKey: [QUERY_KEYS.features] }, (old) =>
        old?.map((f) => (f.id === id ? { ...f, ...movePatch(status, tab) } : f))
      )

      return { previous }
    },
    onError: (err: Error, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(err.message || 'Failed to move feature.')
    },
    onSettled: () => {
      invalidateFeatures(queryClient)
    },
  })
}
