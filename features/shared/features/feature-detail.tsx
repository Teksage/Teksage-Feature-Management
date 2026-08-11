'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { FeatureDetailOverview } from './feature-detail-overview'
import { FeatureForm } from './feature-form'
import { FeatureSubtasks } from './feature-subtasks'
import { FeatureActivity } from './feature-activity'
import { FeatureDocs } from './feature-docs'
import { FeatureAttachments } from './feature-attachments'
import { useGetFeature, useUpsertFeature, useDeleteFeature } from '@/services/features'
import { useGetTeam } from '@/services/team/use-get-team'
import { useAuthStore } from '@/store/auth-store'
import {
  canEditFeatureMeta,
  canManageAssignedFeature,
} from '@/utils/feature-permissions'
import type { FeatureInput } from '@/lib/validations/feature'
import type { FeatureStatus, FeaturePriority } from '@/types/supabase.types'

interface FeatureDetailProps {
  featureId: string
  basePath: string
}

export function FeatureDetail({ featureId, basePath }: FeatureDetailProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: feature, isLoading } = useGetFeature(featureId)
  const { data: members = [] } = useGetTeam()
  const upsert = useUpsertFeature()
  const deleteFeature = useDeleteFeature()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canManage = feature ? canManageAssignedFeature(user, feature) : false
  const canEditMeta = canEditFeatureMeta(user)

  function toPayload(overrides: Partial<FeatureInput> = {}): FeatureInput & { id: string } {
    return {
      title: feature!.title,
      description: feature!.description ?? '',
      status: feature!.status,
      priority: feature!.priority,
      platform: feature!.platform,
      categoryId: feature!.category_id ?? '',
      assigneeId: feature!.assignee_id ?? '',
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
    if (!feature || !value || !canManage) return
    try {
      await upsert.mutateAsync(toPayload({ status: value }))
    } catch {
      /* toast via onError */
    }
  }

  async function handlePriorityChange(value: FeaturePriority | null) {
    if (!feature || !value || !canEditMeta) return
    try {
      await upsert.mutateAsync(toPayload({ priority: value }))
    } catch {
      /* toast via onError */
    }
  }

  async function handleAssigneeChange(assigneeId: string) {
    if (!feature || !canEditMeta) return
    try {
      await upsert.mutateAsync(toPayload({ assigneeId }))
    } catch {
      /* toast via onError */
    }
  }

  if (isLoading) return <PageLoader />
  if (!feature) return <p className="text-muted-foreground p-6">Feature not found.</p>

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <div className="glass-panel flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => router.push(basePath)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold sm:text-base">
          {feature.title}
        </p>
        <StatusBadge status={feature.status} className="shrink-0" />
      </div>

      <Tabs defaultValue="overview" className="flex min-h-0 w-full flex-1 flex-col gap-4">
        <TabsList className="glass-panel flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl p-1.5 shadow-sm">
          <TabsTrigger value="overview" className="min-w-24 flex-1 rounded-lg sm:flex-none">
            Overview
          </TabsTrigger>
          <TabsTrigger value="subtasks" className="min-w-24 flex-1 rounded-lg sm:flex-none">
            Subtasks
          </TabsTrigger>
          <TabsTrigger value="activity" className="min-w-24 flex-1 rounded-lg sm:flex-none">
            Activity
          </TabsTrigger>
          <TabsTrigger value="docs" className="min-w-24 flex-1 rounded-lg sm:flex-none">
            Docs
          </TabsTrigger>
          <TabsTrigger value="files" className="min-w-24 flex-1 rounded-lg sm:flex-none">
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 min-h-0 flex-1 outline-none">
          <FeatureDetailOverview
            feature={feature}
            members={members}
            canChangeStatus={canManage}
            canEditMeta={canEditMeta}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onAssigneeChange={handleAssigneeChange}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />
        </TabsContent>
        <TabsContent value="subtasks" className="mt-0 min-h-0 flex-1 outline-none">
          <FeatureSubtasks featureId={featureId} canManage={canManage} />
        </TabsContent>
        <TabsContent value="activity" className="mt-0 min-h-0 flex-1 outline-none">
          <FeatureActivity featureId={featureId} />
        </TabsContent>
        <TabsContent value="docs" className="mt-0 min-h-0 flex-1 outline-none">
          <FeatureDocs featureId={featureId} canEdit={canEditMeta} />
        </TabsContent>
        <TabsContent value="files" className="mt-0 min-h-0 flex-1 outline-none">
          <FeatureAttachments featureId={featureId} canManage={canEditMeta} />
        </TabsContent>
      </Tabs>

      {canEditMeta && (
        <FormDialog open={editOpen} onOpenChange={setEditOpen} title="Edit Feature" fieldCount={8}>
          <FeatureForm
            defaultValues={feature}
            canManageStatus
            isSubmitting={upsert.isPending}
            onSubmit={handleEdit}
          />
        </FormDialog>
      )}

      {canEditMeta && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Feature"
          description="This will permanently delete the feature."
          confirmLabel="Delete"
          variant="destructive"
          loading={deleteFeature.isPending}
          onConfirm={() =>
            deleteFeature.mutate(featureId, { onSuccess: () => router.push(basePath) })
          }
        />
      )}
    </div>
  )
}
