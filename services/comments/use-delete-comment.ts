'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateComments } from '@/lib/invalidate-queries'

export function useDeleteComment(featureId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from('feature_comments').delete().eq('id', commentId)
      if (error) throw error
    },
    onSuccess: () => {
      invalidateComments(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
