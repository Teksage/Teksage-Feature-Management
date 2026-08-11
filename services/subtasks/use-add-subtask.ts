'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateSubtasks, invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'

export function useAddSubtask(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ title, assigneeId }: { title: string; assigneeId?: string }) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      const { data: existing } = await supabase
        .from('feature_subtasks')
        .select('sort_order')
        .eq('feature_id', featureId)
        .order('sort_order', { ascending: false })
        .limit(1)

      const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1
      const { error } = await supabase.from('feature_subtasks').insert({
        feature_id: featureId,
        title,
        status: 'Idea',
        assignee_id: assigneeId || null,
        created_by: user.id,
        sort_order: sortOrder,
      })
      if (error) throw error
    },
    onSuccess: () => {
      invalidateSubtasks(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
