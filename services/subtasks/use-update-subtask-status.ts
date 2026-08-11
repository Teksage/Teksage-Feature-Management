'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateSubtasks, invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import type { SubtaskStatus } from '@/types/supabase.types'

export function useUpdateSubtaskStatus(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      previousStatus,
    }: {
      id: string
      title: string
      status: SubtaskStatus
      previousStatus: SubtaskStatus
    }) => {
      if (!user) throw new Error('Not authenticated')
      if (status === previousStatus) return

      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from('feature_subtasks').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      invalidateSubtasks(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
