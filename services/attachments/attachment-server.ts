import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AttachmentItem } from '@/types/supabase.types'
import type { IAttachment } from './use-get-attachments'

const BUCKET = 'feature-attachments'

export { BUCKET }

export async function fetchLatestRow(
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

export async function upsertAttachmentItem(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  featureId: string,
  userId: string,
  newItem: AttachmentItem
) {
  const latest = await fetchLatestRow(supabase, featureId)
  if (latest) {
    const { data, error } = await supabase
      .from('feature_attachments')
      .update({ items: [...latest.items, newItem] })
      .eq('id', latest.id)
      .select('id')
    if (error) throw error
    if (!data?.length) throw new Error('Could not save — permission denied or row not found.')
  } else {
    const { error } = await supabase.from('feature_attachments').insert({
      feature_id: featureId,
      items: [newItem],
      uploaded_by: userId,
    })
    if (error) throw error
  }
}

export async function removeAttachmentItem(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  rowId: string,
  itemIndex: number,
  item: AttachmentItem
) {
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
}
