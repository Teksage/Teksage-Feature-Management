'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { AttachmentItem } from '@/types/supabase.types'

export type { AttachmentItem }

/** One DB row = one attachment entry; items[] holds the actual files/links. */
export interface IAttachment {
  id: string
  feature_id: string
  items: AttachmentItem[]
  uploaded_by: string
  created_at: string
  uploader_full_name: string | null
}

export function useGetAttachments(featureId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.attachments, 'v2', featureId],
    queryFn: async (): Promise<IAttachment[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('feature_attachments')
        .select('*, uploader:profiles!uploaded_by(full_name)')
        .eq('feature_id', featureId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        feature_id: row.feature_id,
        items: (row.items as AttachmentItem[]) ?? [],
        uploaded_by: row.uploaded_by,
        created_at: row.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        uploader_full_name: (row.uploader as any)?.full_name ?? null,
      }))
    },
    enabled: !!featureId,
    staleTime: STALE_TIME.short,
  })
}
