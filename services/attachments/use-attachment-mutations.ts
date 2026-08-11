'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateAttachments, invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'

export function useAddAttachmentLink(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ label, url }: { label: string; url: string }) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from('feature_attachments').insert({
        feature_id: featureId,
        kind: 'link',
        label,
        url,
        uploaded_by: user.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Link added.')
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUploadAttachment(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      const path = `${featureId}/${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('feature-attachments')
        .upload(path, file)
      if (uploadError) throw uploadError

      const { error } = await supabase.from('feature_attachments').insert({
        feature_id: featureId,
        kind: 'file',
        label: file.name,
        storage_path: path,
        mime_type: file.type || null,
        uploaded_by: user.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('File uploaded.')
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
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
        await supabase.storage.from('feature-attachments').remove([row.storage_path])
      }
      const { error } = await supabase.from('feature_attachments').delete().eq('id', row.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Removed.')
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
