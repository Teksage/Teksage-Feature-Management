'use client'

import { useState } from 'react'
import { FileUp, Link2, Paperclip, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useGetAttachments } from '@/services/attachments/use-get-attachments'
import {
  useAddAttachmentLink,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/services/attachments/use-attachment-mutations'
import { FeatureDetailPanel } from './feature-detail-panel'
import { FeatureDetailContent } from './feature-detail-content'
import { formatRelative } from '@/utils/format'

interface FeatureAttachmentsProps {
  featureId: string
  canManage: boolean
}

export function FeatureAttachments({ featureId, canManage }: FeatureAttachmentsProps) {
  const { data: items = [], isLoading } = useGetAttachments(featureId)
  const addLink = useAddAttachmentLink(featureId)
  const upload = useUploadAttachment(featureId)
  const remove = useDeleteAttachment(featureId)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  async function openFile(storagePath: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.storage
      .from('feature-attachments')
      .createSignedUrl(storagePath, 60)
    if (error || !data?.signedUrl) return
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    await addLink.mutateAsync({ label: label.trim(), url: url.trim() })
    setLabel('')
    setUrl('')
  }

  if (isLoading) return <PageLoader />

  return (
    <FeatureDetailPanel header={<h3 className="text-sm font-semibold">Files & links</h3>}>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
      {items.length === 0 ? (
        <FeatureDetailContent size="md">
          <EmptyState
            icon={Paperclip}
            title="Nothing attached"
            description="Upload a file or paste an external link."
          />
        </FeatureDetailContent>
      ) : (
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
                  onClick={() => {
                    if (item.kind === 'link' && item.url) {
                      window.open(item.url, '_blank', 'noopener,noreferrer')
                    } else if (item.storage_path) {
                      void openFile(item.storage_path)
                    }
                  }}
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
                    onClick={() =>
                      remove.mutate({
                        id: item.id,
                        label: item.label,
                        kind: item.kind,
                        storage_path: item.storage_path,
                      })
                    }
                  >
                    <Trash2 className="text-destructive h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </FeatureDetailContent>
      )}

      {canManage && (
        <FeatureDetailContent size="sm" className="mt-auto space-y-3 border-t pt-4">
          <form onSubmit={handleLink} className="flex flex-col gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label"
            required
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              required
              className="min-w-0 sm:flex-1"
            />
            <Button type="submit" size="sm" disabled={addLink.isPending} className="shrink-0 self-start">
              Add link
            </Button>
          </div>
        </form>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <span className="bg-muted hover:bg-muted/80 rounded-md border px-3 py-2">
            <FileUp className="mr-1 inline h-4 w-4" />
            Upload file
          </span>
          <input
            type="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) upload.mutate(file)
              e.target.value = ''
            }}
          />
        </label>
        </FeatureDetailContent>
      )}
      </div>
    </FeatureDetailPanel>
  )
}
