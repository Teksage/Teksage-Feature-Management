'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { buildDerivedActivity } from './build-derived-activity'

export interface IActivityItem {
  id: string
  feature_id: string
  actor_id: string
  action: string
  field: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
  actor_full_name: string | null
}

export function useGetActivity(featureId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.activity, featureId],
    queryFn: async (): Promise<IActivityItem[]> => {
      const supabase = getSupabaseBrowserClient()

      const [featureRes, commentsRes, subtasksRes, attachmentsRes, docRes] = await Promise.all([
        supabase
          .from('features')
          .select('created_at, created_by, creator:profiles!created_by(full_name)')
          .eq('id', featureId)
          .maybeSingle(),
        supabase
          .from('feature_comments')
          .select('id, user_id, body, created_at, profiles(full_name)')
          .eq('feature_id', featureId),
        supabase
          .from('feature_subtasks')
          .select(
            'id, title, status, created_by, created_at, updated_at, creator:profiles!created_by(full_name)'
          )
          .eq('feature_id', featureId),
        supabase
          .from('feature_attachments')
          .select('id, kind, label, uploaded_by, created_at, uploader:profiles!uploaded_by(full_name)')
          .eq('feature_id', featureId),
        supabase
          .from('feature_docs')
          .select('body, updated_at, updated_by, updater:profiles!updated_by(full_name)')
          .eq('feature_id', featureId)
          .maybeSingle(),
      ])

      if (featureRes.error) throw featureRes.error
      if (commentsRes.error) throw commentsRes.error
      if (subtasksRes.error) throw subtasksRes.error
      if (attachmentsRes.error) throw attachmentsRes.error
      if (docRes.error) throw docRes.error

      const feature = featureRes.data
        ? {
            created_at: featureRes.data.created_at,
            created_by: featureRes.data.created_by,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            creator: (featureRes.data.creator as any) ?? null,
          }
        : null

      return buildDerivedActivity(
        featureId,
        feature,
        (commentsRes.data ?? []).map((c) => ({
          ...c,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profiles: (c.profiles as any) ?? null,
        })),
        (subtasksRes.data ?? []).map((s) => ({
          ...s,
          status: s.status ?? 'Idea',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          creator: (s.creator as any) ?? null,
        })),
        (attachmentsRes.data ?? []).map((a) => ({
          ...a,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          uploader: (a.uploader as any) ?? null,
        })),
        docRes.data
          ? {
              body: docRes.data.body,
              updated_at: docRes.data.updated_at,
              updated_by: docRes.data.updated_by,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              updater: (docRes.data.updater as any) ?? null,
            }
          : null
      ).slice(0, 100)
    },
    enabled: !!featureId,
    staleTime: STALE_TIME.short,
  })
}
