'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import { invalidateFeatures } from '@/lib/invalidate-queries'

export function useToggleVote() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ featureId, hasVoted }: { featureId: string; hasVoted: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()

      if (hasVoted) {
        const { error } = await supabase
          .from('feature_votes')
          .delete()
          .eq('feature_id', featureId)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('feature_votes')
          .insert({ feature_id: featureId, user_id: user.id })
        if (error) throw error
      }
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.feature, vars.featureId] })
      invalidateFeatures(queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
