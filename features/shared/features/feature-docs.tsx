'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { useGetFeatureDoc, useSaveFeatureDoc } from '@/services/docs/use-feature-docs'
import { FeatureDetailPanel } from './feature-detail-panel'
import { FeatureDetailContent } from './feature-detail-content'
import { formatRelative } from '@/utils/format'

interface FeatureDocsProps {
  featureId: string
  canEdit: boolean
}

export function FeatureDocs({ featureId, canEdit }: FeatureDocsProps) {
  const { data: doc, isLoading } = useGetFeatureDoc(featureId)
  const saveDoc = useSaveFeatureDoc(featureId)
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    setBody(doc?.body ?? '')
  }, [doc?.body])

  if (isLoading) return <PageLoader />

  return (
    <FeatureDetailPanel
      header={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4" />
            <h3 className="text-sm font-semibold">Feature docs</h3>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
              {preview ? 'Edit' : 'Preview'}
            </Button>
            {canEdit && (
              <Button
                type="button"
                size="sm"
                disabled={saveDoc.isPending || body === (doc?.body ?? '')}
                onClick={() => saveDoc.mutate(body)}
              >
                Save
              </Button>
            )}
          </div>
        </div>
      }
    >
      <FeatureDetailContent size="lg" className="flex min-h-0 flex-1 flex-col gap-3">
      {doc?.updater_full_name && (
        <p className="text-muted-foreground text-xs">
          Last edited by {doc.updater_full_name} · {formatRelative(doc.updated_at)}
        </p>
      )}

      {preview || !canEdit ? (
        <div className="bg-muted/30 min-h-48 whitespace-pre-wrap rounded-lg border p-4 text-sm">
          {body.trim() ? body : 'No docs yet.'}
        </div>
      ) : (
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write specs, notes, or acceptance criteria (markdown ok)…"
          className="min-h-48 font-mono text-sm"
        />
      )}
      </FeatureDetailContent>
    </FeatureDetailPanel>
  )
}
