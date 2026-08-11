'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateActivity } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import { runOnce } from '@/utils/run-once'
import type { AttachmentItem } from '@/types/supabase.types'
import {
  applyOptimisticAdd,
  applyOptimisticRemove,
  attachmentsQueryKey,
  getAttachmentsSnapshot,
  patchAttachmentsCache,
  rollbackAttachments,
} from './attachment-cache'
import {
  BUCKET,
  fetchLatestRow,
  removeAttachmentItem,
  upsertAttachmentItem,
} from './attachment-server'
import { uploadAttachmentFile } from './upload-file'

function linkKey(featureId: string, url: string) {
  return `link:${featureId}:${url.trim().toLowerCase()}`
}

function fileKey(featureId: string, file: File) {
  return `file:${featureId}:${file.name}:${file.size}:${file.lastModified}`
}

function syncAttachments(queryClient: ReturnType<typeof useQueryClient>, featureId: string) {
  void queryClient.invalidateQueries({ queryKey: attachmentsQueryKey(featureId) })
  invalidateActivity(queryClient, featureId)
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
        const latest = await fetchLatestRow(supabase, featureId)
        if (latest) {
          const dup = latest.items.some(
            (i) => i.kind === 'link' && i.url?.trim().toLowerCase() === trimmedUrl.toLowerCase()
          )
          if (dup) throw new Error('This link is already attached.')
        }
        await upsertAttachmentItem(supabase, featureId, user.id, {
          kind: 'link',
          label: trimmedLabel,
          url: trimmedUrl,
        })
      })
    },
    onMutate: async ({ label, url }) => {
      if (!user) return
      await queryClient.cancelQueries({ queryKey: attachmentsQueryKey(featureId) })
      const snapshot = getAttachmentsSnapshot(queryClient, featureId)
      patchAttachmentsCache(queryClient, featureId, (rows) =>
        applyOptimisticAdd(rows, featureId, user.id, {
          kind: 'link',
          label: label.trim(),
          url: url.trim(),
        })
      )
      return { snapshot }
    },
    onError: (err, _vars, ctx) => {
      rollbackAttachments(queryClient, featureId, ctx?.snapshot)
      toast.error(err instanceof Error ? err.message : 'Failed to add link')
    },
    onSuccess: () => toast.success('Link added.'),
    onSettled: () => syncAttachments(queryClient, featureId),
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
        await uploadAttachmentFile(file, storagePath)

        const newItem: AttachmentItem = {
          kind: 'file',
          label: file.name,
          storage_path: storagePath,
          mime_type: file.type || null,
        }

        try {
          await upsertAttachmentItem(supabase, featureId, user.id, newItem)
        } catch (err) {
          await supabase.storage.from(BUCKET).remove([storagePath])
          throw err
        }
      })
    },
    onMutate: async ({ file, storagePath }) => {
      if (!user) return
      await queryClient.cancelQueries({ queryKey: attachmentsQueryKey(featureId) })
      const snapshot = getAttachmentsSnapshot(queryClient, featureId)
      patchAttachmentsCache(queryClient, featureId, (rows) =>
        applyOptimisticAdd(rows, featureId, user.id, {
          kind: 'file',
          label: file.name,
          storage_path: storagePath,
          mime_type: file.type || null,
        })
      )
      return { snapshot }
    },
    onError: (err, _vars, ctx) => {
      rollbackAttachments(queryClient, featureId, ctx?.snapshot)
      const message =
        err instanceof Error
          ? /failed to fetch/i.test(err.message)
            ? 'Upload blocked by the network. Redeploy after setting Supabase env vars on Vercel.'
            : err.message
          : 'Failed to upload file'
      toast.error(message)
    },
    onSuccess: () => toast.success('File uploaded.'),
    onSettled: () => syncAttachments(queryClient, featureId),
  })
}

export function useRemoveAttachmentItem(featureId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (vars: { rowId: string; itemIndex: number; item: AttachmentItem }) => {
      if (!user) throw new Error('Not authenticated')
      await removeAttachmentItem(getSupabaseBrowserClient(), vars.rowId, vars.itemIndex, vars.item)
    },
    onMutate: async ({ rowId, itemIndex }) => {
      await queryClient.cancelQueries({ queryKey: attachmentsQueryKey(featureId) })
      const snapshot = getAttachmentsSnapshot(queryClient, featureId)
      patchAttachmentsCache(queryClient, featureId, (rows) =>
        applyOptimisticRemove(rows, rowId, itemIndex)
      )
      return { snapshot }
    },
    onError: (err, _vars, ctx) => {
      rollbackAttachments(queryClient, featureId, ctx?.snapshot)
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    },
    onSuccess: () => toast.success('Removed.'),
    onSettled: () => syncAttachments(queryClient, featureId),
  })
}

export const useDeleteAttachment = useRemoveAttachmentItem
