'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateAttachments, invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import { runOnce } from '@/utils/run-once'

const BUCKET = 'feature-attachments'

function linkKey(featureId: string, url: string) {
  return `link:${featureId}:${url.trim().toLowerCase()}`
}

function fileKey(featureId: string, file: File) {
  return `file:${featureId}:${file.name}:${file.size}:${file.lastModified}`
}

export function useAddAttachmentLink(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ label, url }: { label: string; url: string }) => {
      if (!user) throw new Error('Not authenticated')

      const trimmedUrl = url.trim()
      const trimmedLabel = label.trim()
      if (!trimmedLabel || !trimmedUrl) throw new Error('Label and URL are required')

      return runOnce(linkKey(featureId, trimmedUrl), async () => {
        const supabase = getSupabaseBrowserClient()

        const { data: existing } = await supabase
          .from('feature_attachments')
          .select('id')
          .eq('feature_id', featureId)
          .eq('kind', 'link')
          .eq('url', trimmedUrl)
          .maybeSingle()

        if (existing) throw new Error('This link is already attached to this feature.')

        const { data, error } = await supabase
          .from('feature_attachments')
          .insert({
            feature_id: featureId,
            kind: 'link',
            label: trimmedLabel,
            url: trimmedUrl,
            uploaded_by: user.id,
          })
          .select('id')
          .single()

        if (error) throw error
        return data
      })
    },
    onSuccess: () => {
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
  })
}

export function useUploadAttachment(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ file, storagePath }: { file: File; storagePath: string }) => {
      if (!user) throw new Error('Not authenticated')

      return runOnce(fileKey(featureId, file), async () => {
        const supabase = getSupabaseBrowserClient()

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, { upsert: false })

        if (uploadError) throw uploadError

        const { data, error } = await supabase
          .from('feature_attachments')
          .insert({
            feature_id: featureId,
            kind: 'file',
            label: file.name,
            storage_path: storagePath,
            mime_type: file.type || null,
            uploaded_by: user.id,
          })
          .select('id')
          .single()

        if (error) {
          await supabase.storage.from(BUCKET).remove([storagePath])
          throw error
        }

        return data
      })
    },
    onSuccess: () => {
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
  })
}

export function useDeleteAttachment(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (row: {
      id: string
      label: string
      kind: string
      storage_path: string | null
    }) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      if (row.kind === 'file' && row.storage_path) {
        await supabase.storage.from(BUCKET).remove([row.storage_path])
      }
      const { error } = await supabase.from('feature_attachments').delete().eq('id', row.id)
      if (error) throw error
    },
    onSuccess: () => {
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
  })
}
