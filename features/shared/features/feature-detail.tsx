'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { ReleaseCountdown } from '@/components/shared/data-display/release-countdown'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { FeatureVoteButton } from './feature-vote-button'
import { FeatureComments } from './feature-comments'
import { FeatureForm } from './feature-form'
import { useGetFeature } from '@/services/features'
import { useUpsertFeature } from '@/services/features'
import { useDeleteFeature } from '@/services/features'
import { FEATURE_STATUSES, FEATURE_PRIORITIES } from '@/lib/constants'
import type { FeatureInput } from '@/lib/validations/feature'
import type { FeatureStatus, FeaturePriority } from '@/types/supabase.types'

interface FeatureDetailProps {
  featureId: string
  basePath: string
  canManageStatus: boolean
}

export function FeatureDetail({ featureId, basePath, canManageStatus }: FeatureDetailProps) {
  const router = useRouter()
  const { data: feature, isLoading } = useGetFeature(featureId)
  const upsert = useUpsertFeature()
  const deleteFeature = useDeleteFeature()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function toPayload(
    overrides: Partial<FeatureInput> = {}
  ): FeatureInput & { id: string } {
    return {
      title: feature!.title,
      description: feature!.description ?? '',
      status: feature!.status,
      priority: feature!.priority,
      platform: feature!.platform,
      categoryId: feature!.category_id ?? '',
      targetRelease: feature!.target_release ?? '',
      ...overrides,
      id: featureId,
    }
  }

  async function handleEdit(data: FeatureInput) {
    await upsert.mutateAsync({ ...data, id: featureId })
    setEditOpen(false)
  }

  async function handleStatusChange(value: FeatureStatus | null) {
    if (!feature || !value) return
    await upsert.mutateAsync(toPayload({ status: value }))
  }

  async function handlePriorityChange(value: FeaturePriority | null) {
    if (!feature || !value) return
    await upsert.mutateAsync(toPayload({ priority: value }))
  }

  if (isLoading) return <PageLoader />
  if (!feature) return <p className="text-muted-foreground p-6">Feature not found.</p>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push(basePath)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold leading-tight">{feature.title}</h1>
          <FeatureVoteButton featureId={feature.id} voteCount={feature.vote_count} hasVoted={feature.has_voted} />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {canManageStatus ? (
            <>
              <Select value={feature.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FEATURE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={feature.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FEATURE_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <StatusBadge status={feature.status} />
              <StatusBadge status={feature.priority} />
            </>
          )}
          {feature.category_name && <span className="text-muted-foreground text-xs">in {feature.category_name}</span>}
          <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-[11px]">
            {feature.platform}
          </span>
          <ReleaseCountdown date={feature.target_release} showDate />
        </div>

        {feature.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feature.description}</p>}

        {canManageStatus && (
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}
      </div>

      <Separator />
      <FeatureComments featureId={featureId} />

      <FormDialog open={editOpen} onOpenChange={setEditOpen} title="Edit Feature">
        <FeatureForm defaultValues={feature} canManageStatus={canManageStatus} isSubmitting={upsert.isPending} onSubmit={handleEdit} />
      </FormDialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Feature" description="This will permanently delete the feature." confirmLabel="Delete" variant="destructive" loading={deleteFeature.isPending}
        onConfirm={() => deleteFeature.mutate(featureId, { onSuccess: () => router.push(basePath) })} />
    </div>
  )
}
