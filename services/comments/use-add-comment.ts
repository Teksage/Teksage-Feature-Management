'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import {
  invalidateComments,
  invalidateActivity,
  invalidateNotifications,
} from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import { createNotification } from '@/services/notifications/create-notification'

export function useAddComment() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ featureId, body }: { featureId: string; body: string }) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from('feature_comments')
        .insert({ feature_id: featureId, user_id: user.id, body })
      if (error) throw error

      const { data: feature } = await supabase
        .from('features')
        .select('title, created_by, assignee_id')
        .eq('id', featureId)
        .single()

      const recipients = new Set<string>()
      if (feature?.created_by) recipients.add(feature.created_by)
      if (feature?.assignee_id) recipients.add(feature.assignee_id)
      for (const userId of recipients) {
        await createNotification(
          {
            userId,
            featureId,
            type: 'comment',
            title: 'New comment on a feature',
            body: feature?.title ?? body.slice(0, 80),
          },
          user.id
        )
      }
    },
    onSuccess: (_, vars) => {
      invalidateComments(queryClient, vars.featureId)
      invalidateActivity(queryClient, vars.featureId)
      invalidateNotifications(queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
