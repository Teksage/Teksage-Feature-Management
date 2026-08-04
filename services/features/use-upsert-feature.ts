'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateFeatures } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import type { FeatureInput } from '@/lib/validations/feature'
import type { FeaturePlatform, FeatureStatus } from '@/types/supabase.types'

interface UpsertFeaturePayload extends FeatureInput {
  id?: string
}

function platformStatuses(platform: FeaturePlatform, status: FeatureStatus) {
  if (platform === 'Website') return { web_status: status, app_status: null as FeatureStatus | null }
  if (platform === 'App') return { web_status: null as FeatureStatus | null, app_status: status }
  return { web_status: status, app_status: status }
}

export function useUpsertFeature() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: UpsertFeaturePayload) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()

      const base = {
        title: payload.title,
        description: payload.description || null,
        status: payload.status,
        priority: payload.priority,
        platform: payload.platform,
        category_id: payload.categoryId || null,
        target_release: payload.targetRelease || null,
      }

      if (payload.id) {
        const { data: existing, error: readError } = await supabase
          .from('features')
          .select('platform, web_status, app_status')
          .eq('id', payload.id)
          .single()
        if (readError) throw readError

        const surface =
          existing.platform === payload.platform && payload.platform === 'Both'
            ? {
                web_status: existing.web_status as FeatureStatus | null,
                app_status: existing.app_status as FeatureStatus | null,
              }
            : platformStatuses(payload.platform, payload.status)

        const { error } = await supabase
          .from('features')
          .update({ ...base, ...surface, updated_at: new Date().toISOString() })
          .eq('id', payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('features').insert({
          ...base,
          ...platformStatuses(payload.platform, payload.status),
          created_by: user.id,
        })
        if (error) throw error
      }
    },
    onSuccess: (_, vars) => {
      toast.success(vars.id ? 'Feature updated.' : 'Feature created.')
      invalidateFeatures(queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
