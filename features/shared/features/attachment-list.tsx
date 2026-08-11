'use client'

import { FileUp, Link2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureDetailContent } from './feature-detail-content'
import { formatRelative } from '@/utils/format'
import type { IAttachment } from '@/services/attachments/use-get-attachments'
import type { AttachmentItem } from '@/types/supabase.types'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface AttachmentListProps {
  rows: IAttachment[]
  canManage: boolean
  onRemove: (rowId: string, itemIndex: number, item: AttachmentItem) => void
}

async function openItem(entry: AttachmentItem) {
  if (entry.kind === 'link' && entry.url) {
    window.open(entry.url, '_blank', 'noopener,noreferrer')
    return
  }
  if (entry.storage_path) {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.storage
      .from('feature-attachments')
      .createSignedUrl(entry.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }
}

export function AttachmentList({ rows, canManage, onRemove }: AttachmentListProps) {
  return (
    <FeatureDetailContent size="md">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="bg-muted/30 space-y-1.5 rounded-lg border px-3 py-2.5">
            <p className="text-muted-foreground flex items-center justify-between text-[10px] uppercase tracking-wide">
              <span>{formatRelative(row.created_at)}</span>
              <span>{row.uploader_full_name ?? ''}</span>
            </p>
            <ul className="space-y-1">
              {row.items.map((entry, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="hover:text-primary flex min-w-0 items-center gap-2 text-left text-sm"
                    onClick={() => void openItem(entry)}
                  >
                    {entry.kind === 'link' ? (
                      <Link2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <FileUp className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate font-medium">{entry.label}</span>
                    {entry.kind === 'link' && entry.url && (
                      <span className="text-muted-foreground hidden truncate text-xs sm:block">
                        {entry.url}
                      </span>
                    )}
                  </button>
                  {canManage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => void onRemove(row.id, idx, entry)}
                    >
                      <Trash2 className="text-destructive h-3.5 w-3.5" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </FeatureDetailContent>
  )
}
