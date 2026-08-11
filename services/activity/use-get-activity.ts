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

type ProfileRef = { full_name: string } | null

/** Supabase may type nested profiles as object or array — normalize to one. */
function asProfile(value: unknown): ProfileRef {
  if (!value) return null
  if (Array.isArray(value)) {
    const first = value[0] as { full_name?: string } | undefined
    return first?.full_name ? { full_name: first.full_name } : null
  }
  if (typeof value === 'object' && value !== null && 'full_name' in value) {
    const name = (value as { full_name?: string }).full_name
    return name ? { full_name: name } : null
  }
  return null
}

/** Soft-fail a source so one broken table cannot blank the whole timeline. */
async function safeQuery<T>(
  promise: PromiseLike<{ data: T; error: { message: string } | null }>
): Promise<T | null> {
  try {
    const { data, error } = await promise
    if (error) {
      console.warn('[activity]', error.message)
      return null
    }
    return data
  } catch (err) {
    console.warn('[activity]', err)
    return null
  }
}

export function useGetActivity(featureId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.activity, featureId],
    queryFn: async (): Promise<IActivityItem[]> => {
      const supabase = getSupabaseBrowserClient()

      const [feature, comments, subtasks, attachments, doc] = await Promise.all([
        safeQuery(
          supabase
            .from('features')
            .select('created_at, created_by, creator:profiles!created_by(full_name)')
            .eq('id', featureId)
            .maybeSingle()
        ),
        safeQuery(
          supabase
            .from('feature_comments')
            .select('id, user_id, body, created_at, profiles(full_name)')
            .eq('feature_id', featureId)
        ),
        safeQuery(
          supabase
            .from('feature_subtasks')
            .select(
              'id, title, status, created_by, created_at, updated_at, creator:profiles!created_by(full_name)'
            )
            .eq('feature_id', featureId)
        ),
        safeQuery(
          supabase
            .from('feature_attachments')
            .select('id, items, uploaded_by, created_at, uploader:profiles!uploaded_by(full_name)')
            .eq('feature_id', featureId)
        ),
        safeQuery(
          supabase
            .from('feature_docs')
            .select('body, updated_at, updated_by, updater:profiles!updated_by(full_name)')
            .eq('feature_id', featureId)
            .maybeSingle()
        ),
      ])

      return buildDerivedActivity(
        featureId,
        feature
          ? {
              created_at: feature.created_at,
              created_by: feature.created_by,
              creator: asProfile(feature.creator),
            }
          : null,
        (comments ?? []).map((c) => ({
          id: c.id,
          user_id: c.user_id,
          body: c.body,
          created_at: c.created_at,
          profiles: asProfile(c.profiles),
        })),
        (subtasks ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status ?? 'Idea',
          created_by: s.created_by,
          created_at: s.created_at,
          updated_at: s.updated_at,
          creator: asProfile(s.creator),
        })),
        (attachments ?? []).map((a) => ({
          id: a.id,
          items: (a.items as Array<{ kind: string; label: string }>) ?? [],
          uploaded_by: a.uploaded_by,
          created_at: a.created_at,
          uploader: asProfile(a.uploader),
        })),
        doc
          ? {
              body: doc.body,
              updated_at: doc.updated_at,
              updated_by: doc.updated_by,
              updater: asProfile(doc.updater),
            }
          : null
      ).slice(0, 100)
    },
    enabled: !!featureId,
    staleTime: STALE_TIME.short,
  })
}
