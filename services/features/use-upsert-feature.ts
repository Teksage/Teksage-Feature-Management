'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateFeatures, invalidateNotifications } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import { createNotification } from '@/services/notifications/create-notification'
import type { FeatureInput } from '@/lib/validations/feature'
import type { FeatureDomain, FeaturePlatform, FeatureStatus } from '@/types/supabase.types'

interface UpsertFeaturePayload extends FeatureInput {
  id?: string
  domain?: FeatureDomain
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
        assignee_id: payload.assigneeId || null,
        target_release: payload.targetRelease || null,
        domain: payload.domain ?? 'product',
      }

      if (payload.id) {
        const { data: existing, error: readError } = await supabase
          .from('features')
          .select('title, status, priority, platform, web_status, app_status, assignee_id, created_by')
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

        if ((existing.assignee_id ?? '') !== (payload.assigneeId || '')) {
          if (payload.assigneeId) {
            await createNotification(
              {
                userId: payload.assigneeId,
                featureId: payload.id,
                type: 'assigned',
                title:
                  payload.domain === 'marketing'
                    ? 'You were assigned a plan'
                    : 'You were assigned a feature',
                body: existing.title,
              },
              user.id
            )
          }
        }
      } else {
        const { data: created, error } = await supabase
          .from('features')
          .insert({
            ...base,
            ...platformStatuses(payload.platform, payload.status),
            created_by: user.id,
          })
          .select('id')
          .single()
        if (error) throw error
        if (created?.id && payload.assigneeId) {
          await createNotification(
            {
              userId: payload.assigneeId,
              featureId: created.id,
              type: 'assigned',
              title:
                payload.domain === 'marketing'
                  ? 'You were assigned a plan'
                  : 'You were assigned a feature',
              body: payload.title,
            },
            user.id
          )
        }
      }
    },
    onSuccess: (_, vars) => {
      const isMarketing = vars.domain === 'marketing'
      toast.success(
        vars.id
          ? isMarketing
            ? 'Plan updated.'
            : 'Feature updated.'
          : isMarketing
            ? 'Plan created.'
            : 'Feature created.'
      )
      invalidateFeatures(queryClient)
      invalidateNotifications(queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
