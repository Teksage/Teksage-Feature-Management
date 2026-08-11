'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { invalidateDocs, invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'

export interface IFeatureDoc {
  id: string
  feature_id: string
  body: string
  updated_by: string | null
  updated_at: string
  updater_full_name: string | null
}

export function useGetFeatureDoc(featureId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.docs, featureId],
    queryFn: async (): Promise<IFeatureDoc | null> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('feature_docs')
        .select('*, updater:profiles!updated_by(full_name)')
        .eq('feature_id', featureId)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return {
        ...data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updater_full_name: (data.updater as any)?.full_name ?? null,
      }
    },
    enabled: !!featureId,
    staleTime: STALE_TIME.short,
  })
}

export function useSaveFeatureDoc(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (body: string) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      const { data: existing } = await supabase
        .from('feature_docs')
        .select('id')
        .eq('feature_id', featureId)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from('feature_docs')
          .update({ body, updated_by: user.id })
          .eq('feature_id', featureId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('feature_docs').insert({
          feature_id: featureId,
          body,
          updated_by: user.id,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success('Docs saved.')
      invalidateDocs(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
