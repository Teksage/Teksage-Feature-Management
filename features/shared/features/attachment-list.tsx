'use client'

import { FileUp, Link2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureDetailContent } from './feature-detail-content'
import { formatRelative } from '@/utils/format'
import type { IAttachment } from '@/services/attachments/use-get-attachments'

interface AttachmentListProps {
  items: IAttachment[]
  canManage: boolean
  onOpen: (item: IAttachment) => void
  onRemove: (item: IAttachment) => Promise<void>
}

export function AttachmentList({ items, canManage, onOpen, onRemove }: AttachmentListProps) {
  return (
    <FeatureDetailContent size="md">
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="bg-muted/30 flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
          >
            <button
              type="button"
              className="hover:text-primary flex min-w-0 items-center gap-2 text-left text-sm"
              onClick={() => onOpen(item)}
            >
              {item.kind === 'link' ? (
                <Link2 className="h-4 w-4 shrink-0" />
              ) : (
                <FileUp className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate font-medium">{item.label}</span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatRelative(item.created_at)}
              </span>
            </button>
            {canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => void onRemove(item)}
              >
                <Trash2 className="text-destructive h-3.5 w-3.5" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </FeatureDetailContent>
  )
}
