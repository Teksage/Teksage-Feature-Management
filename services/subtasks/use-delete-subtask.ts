'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateSubtasks, invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'

export function useDeleteSubtask(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id }: { id: string; title: string }) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from('feature_subtasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Subtask deleted.')
      invalidateSubtasks(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
