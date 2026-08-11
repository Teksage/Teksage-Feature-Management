import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import type { AttachmentItem } from '@/types/supabase.types'
import type { IAttachment } from './use-get-attachments'

export function attachmentsQueryKey(featureId: string) {
  return [QUERY_KEYS.attachments, 'v2', featureId] as const
}

export function getAttachmentsSnapshot(queryClient: QueryClient, featureId: string) {
  return queryClient.getQueryData<IAttachment[]>(attachmentsQueryKey(featureId))
}

export function patchAttachmentsCache(
  queryClient: QueryClient,
  featureId: string,
  updater: (rows: IAttachment[]) => IAttachment[]
) {
  queryClient.setQueryData<IAttachment[]>(attachmentsQueryKey(featureId), (old = []) =>
    updater(old)
  )
}

export function rollbackAttachments(
  queryClient: QueryClient,
  featureId: string,
  snapshot: IAttachment[] | undefined
) {
  queryClient.setQueryData(attachmentsQueryKey(featureId), snapshot)
}

function latestRow(rows: IAttachment[]) {
  return rows[0] ?? null
}

export function applyOptimisticAdd(
  rows: IAttachment[],
  featureId: string,
  userId: string,
  item: AttachmentItem
): IAttachment[] {
  const row = latestRow(rows)
  if (row) {
    return rows.map((r, i) =>
      i === 0 ? { ...r, items: [...r.items, item] } : r
    )
  }
  return [
    {
      id: `optimistic-${crypto.randomUUID()}`,
      feature_id: featureId,
      items: [item],
      uploaded_by: userId,
      created_at: new Date().toISOString(),
      uploader_full_name: null,
    },
    ...rows,
  ]
}

export function applyOptimisticRemove(
  rows: IAttachment[],
  rowId: string,
  itemIndex: number
): IAttachment[] {
  return rows.flatMap((row) => {
    if (row.id !== rowId) return [row]
    const remaining = row.items.filter((_, i) => i !== itemIndex)
    return remaining.length > 0 ? [{ ...row, items: remaining }] : []
  })
}
