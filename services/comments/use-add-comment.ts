'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateComments } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'

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
    },
    onSuccess: (_, vars) => {
      invalidateComments(queryClient, vars.featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
