'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateAttachments, invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import { runOnce } from '@/utils/run-once'
import type { AttachmentItem } from '@/types/supabase.types'
import type { IAttachment } from './use-get-attachments'

const BUCKET = 'feature-attachments'

function linkKey(featureId: string, url: string) {
  return `link:${featureId}:${url.trim().toLowerCase()}`
}

function fileKey(featureId: string, file: File) {
  return `file:${featureId}:${file.name}:${file.size}:${file.lastModified}`
}

async function fetchLatestRow(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  featureId: string
): Promise<IAttachment | null> {
  const { data } = await supabase
    .from('feature_attachments')
    .select('id, feature_id, items, uploaded_by, created_at')
    .eq('feature_id', featureId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    feature_id: data.feature_id,
    items: (data.items as AttachmentItem[]) ?? [],
    uploaded_by: data.uploaded_by,
    created_at: data.created_at,
    uploader_full_name: null,
  }
}

async function upsertItem(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  featureId: string,
  userId: string,
  newItem: AttachmentItem
) {
  const latest = await fetchLatestRow(supabase, featureId)

  if (latest) {
    const updatedItems = [...latest.items, newItem]
    const { data, error } = await supabase
      .from('feature_attachments')
      .update({ items: updatedItems })
      .eq('id', latest.id)
      .select('id')
    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error('Could not save — permission denied or row not found.')
    }
  } else {
    const { error } = await supabase.from('feature_attachments').insert({
      feature_id: featureId,
      items: [newItem],
      uploaded_by: userId,
    })
    if (error) throw error
  }
}

/** Add a link to the single entry row, creating it if needed. */
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
        const latest = await fetchLatestRow(supabase, featureId)
        if (latest) {
          const dup = latest.items.some(
            (i) => i.kind === 'link' && i.url?.trim().toLowerCase() === trimmedUrl.toLowerCase()
          )
          if (dup) throw new Error('This link is already attached.')
        }
        const newItem: AttachmentItem = { kind: 'link', label: trimmedLabel, url: trimmedUrl }
        await upsertItem(supabase, featureId, user.id, newItem)
      })
    },
    onSuccess: () => {
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
  })
}

/** Upload a file and add it to the single entry row, creating it if needed. */
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

        const newItem: AttachmentItem = {
          kind: 'file',
          label: file.name,
          storage_path: storagePath,
          mime_type: file.type || null,
        }

        try {
          await upsertItem(supabase, featureId, user.id, newItem)
        } catch (err) {
          // Roll back storage upload if DB write fails
          await supabase.storage.from(BUCKET).remove([storagePath])
          throw err
        }
      })
    },
    onSuccess: () => {
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
  })
}

/** Remove a single item from a row; delete the whole row if it becomes empty. */
export function useRemoveAttachmentItem(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      rowId,
      itemIndex,
      item,
    }: {
      rowId: string
      itemIndex: number
      item: AttachmentItem
    }) => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()

      const { data: row } = await supabase
        .from('feature_attachments')
        .select('items')
        .eq('id', rowId)
        .single()

      if (!row) return

      const remaining = (row.items as AttachmentItem[]).filter((_, i) => i !== itemIndex)

      if (item.kind === 'file' && item.storage_path) {
        await supabase.storage.from(BUCKET).remove([item.storage_path])
      }

      if (remaining.length === 0) {
        const { error } = await supabase.from('feature_attachments').delete().eq('id', rowId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('feature_attachments')
          .update({ items: remaining })
          .eq('id', rowId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      invalidateAttachments(queryClient, featureId)
      invalidateActivity(queryClient, featureId)
    },
  })
}

/** @deprecated use useRemoveAttachmentItem */
export const useDeleteAttachment = useRemoveAttachmentItem
