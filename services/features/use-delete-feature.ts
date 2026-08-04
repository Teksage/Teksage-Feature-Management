'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateFeatures } from '@/lib/invalidate-queries'

export function useDeleteFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from('features').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Feature deleted.')
      invalidateFeatures(queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
