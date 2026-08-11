'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

export interface IAttachment {
  id: string
  feature_id: string
  kind: 'file' | 'link'
  label: string
  url: string | null
  storage_path: string | null
  mime_type: string | null
  uploaded_by: string
  created_at: string
  uploader_full_name: string | null
}

export function useGetAttachments(featureId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.attachments, featureId],
    queryFn: async (): Promise<IAttachment[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('feature_attachments')
        .select('*, uploader:profiles!uploaded_by(full_name)')
        .eq('feature_id', featureId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        ...row,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        uploader_full_name: (row.uploader as any)?.full_name ?? null,
      }))
    },
    enabled: !!featureId,
    staleTime: STALE_TIME.short,
  })
}
