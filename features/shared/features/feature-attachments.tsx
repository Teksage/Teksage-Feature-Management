'use client'

import { useRef, useState } from 'react'
import { FileUp, Paperclip } from 'lucide-react'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useGetAttachments } from '@/services/attachments/use-get-attachments'
import {
  useAddAttachmentLink,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/services/attachments/use-attachment-mutations'
import { FeatureDetailPanel } from './feature-detail-panel'
import { FeatureDetailContent } from './feature-detail-content'
import { AttachmentLinkForm } from './attachment-link-form'
import { AttachmentList } from './attachment-list'
import { AttachmentUploadDialog } from './attachment-upload-dialog'
import type { IAttachment } from '@/services/attachments/use-get-attachments'

interface FeatureAttachmentsProps {
  featureId: string
  canManage: boolean
}

export function FeatureAttachments({ featureId, canManage }: FeatureAttachmentsProps) {
  const { data: items = [], isLoading } = useGetAttachments(featureId)
  const addLink = useAddAttachmentLink(featureId)
  const upload = useUploadAttachment(featureId)
  const remove = useDeleteAttachment(featureId)
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function openFile(storagePath: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.storage
      .from('feature-attachments')
      .createSignedUrl(storagePath, 60)
    if (error || !data?.signedUrl) return
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  function openItem(item: IAttachment) {
    if (item.kind === 'link' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    } else if (item.storage_path) {
      void openFile(item.storage_path)
    }
  }

  async function handleAddLink(values: { label: string; url: string }) {
    try {
      await addLink.mutateAsync(values)
      toast.success('Link added.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add link')
      throw err
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || uploadingFile) return

    const storagePath = `${featureId}/${crypto.randomUUID()}-${file.name}`
    setUploadingFile(file.name)

    try {
      await upload.mutateAsync({ file, storagePath })
      toast.success('File uploaded.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploadingFile(null)
    }
  }

  async function handleRemove(item: IAttachment) {
    try {
      await remove.mutateAsync({
        id: item.id,
        label: item.label,
        kind: item.kind,
        storage_path: item.storage_path,
      })
      toast.success('Removed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    }
  }

  if (isLoading) return <PageLoader />

  return (
    <>
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
            <AttachmentList
              items={items}
              canManage={canManage}
              onOpen={openItem}
              onRemove={handleRemove}
            />
          )}

          {canManage && (
            <FeatureDetailContent size="sm" className="mt-auto space-y-4 border-t pt-4">
              <AttachmentLinkForm disabled={!!uploadingFile} onSubmit={handleAddLink} />

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Upload file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  disabled={!!uploadingFile}
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  disabled={!!uploadingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-muted hover:bg-muted/80 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                >
                  <FileUp className="h-4 w-4" />
                  {uploadingFile ? 'Uploading…' : 'Choose file'}
                </button>
              </div>
            </FeatureDetailContent>
          )}
        </div>
      </FeatureDetailPanel>

      <AttachmentUploadDialog open={!!uploadingFile} fileName={uploadingFile ?? ''} />
    </>
  )
}
