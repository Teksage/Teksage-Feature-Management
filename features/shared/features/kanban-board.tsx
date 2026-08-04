'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { PageHeader } from '@/components/shared/layout/page-header'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureForm } from './feature-form'
import { FeatureBoardFilters, type FeatureBoardFilterValues } from './feature-board-filters'
import { KanbanColumn } from './kanban-column'
import { BOARD_TAB_ACCENT } from './board-tab-accent'
import { cn } from '@/utils/cn'
import {
  useGetFeatures,
  useUpsertFeature,
  useDeleteFeature,
  useMoveFeature,
} from '@/services/features'
import {
  FEATURE_BOARD_TABS,
  FEATURE_STATUSES,
  type FeatureBoardTab,
} from '@/lib/constants'
import { matchesBoardTab, statusForTab } from '@/services/features/features.types'
import type { FeatureInput } from '@/lib/validations/feature'
import type { FeaturePlatform, FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from '@/services/features/features.types'

interface KanbanBoardProps {
  basePath: string
  canManageStatus: boolean
}

const EMPTY_FILTERS: FeatureBoardFilterValues = {
  search: '',
  priority: undefined,
  platform: undefined,
  categoryId: undefined,
}

function defaultPlatformForTab(tab: FeatureBoardTab): FeaturePlatform {
  return tab === 'Web' ? 'Website' : 'App'
}

export function KanbanBoard({ basePath, canManageStatus }: KanbanBoardProps) {
  const [tab, setTab] = useState<FeatureBoardTab>('Web')
  const [filters, setFilters] = useState<FeatureBoardFilterValues>(EMPTY_FILTERS)
  const [createStatus, setCreateStatus] = useState<FeatureStatus>('Idea')
  const [createOpen, setCreateOpen] = useState(false)
  const [editFeature, setEditFeature] = useState<IFeatureEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(filters.search, 300)
  const {
    data: allFeatures = [],
    isLoading,
    error,
  } = useGetFeatures({
    search: debouncedSearch || undefined,
    priority: filters.priority,
    platform: filters.platform,
    categoryId: filters.categoryId,
  })

  const upsert = useUpsertFeature()
  const deleteFeature = useDeleteFeature()
  const moveFeature = useMoveFeature()

  const tabFeatures = useMemo(
    () => allFeatures.filter((f) => matchesBoardTab(f, tab)),
    [allFeatures, tab]
  )

  function handleAdd(status: FeatureStatus) {
    setCreateStatus(status)
    setCreateOpen(true)
  }

  async function handleSubmit(data: FeatureInput, id?: string) {
    await upsert.mutateAsync({ ...data, id })
    setCreateOpen(false)
    setEditFeature(null)
  }

  function handleDropFeature(featureId: string, status: FeatureStatus) {
    const f = allFeatures.find((x) => x.id === featureId)
    if (!f || statusForTab(f, tab) === status) return
    moveFeature.mutate({ id: featureId, status, tab })
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader title="Features" description="Track Web and App delivery on separate boards.">
        <FeatureBoardFilters values={filters} onChange={setFilters} />
      </PageHeader>

      {error && (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load features"
          description={error.message}
        />
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          if (v === 'Web' || v === 'App') setTab(v)
        }}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <TabsList>
          {FEATURE_BOARD_TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className={cn('min-w-24 px-4', BOARD_TAB_ACCENT[t.id].trigger)}
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {FEATURE_BOARD_TABS.map((t) => (
          <TabsContent key={t.id} value={t.id} className="min-h-0 flex-1 overflow-x-auto pb-4">
            {tab === t.id && (
              <div className="flex min-w-max gap-3">
                {FEATURE_STATUSES.map((status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    tab={tab}
                    features={tabFeatures.filter((f) => statusForTab(f, tab) === status)}
                    basePath={basePath}
                    canManageStatus={canManageStatus}
                    onAdd={handleAdd}
                    onEdit={(f) => setEditFeature(f)}
                    onDelete={(id) => setDeleteId(id)}
                    onDropFeature={handleDropFeature}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <FormDialog
        open={createOpen}
        onOpenChange={(o) => {
          if (!o) setCreateOpen(false)
        }}
        title="New Feature"
      >
        <FeatureForm
          defaultValues={{ status: createStatus, platform: defaultPlatformForTab(tab) }}
          canManageStatus={canManageStatus}
          isSubmitting={upsert.isPending}
          onSubmit={(d) => handleSubmit(d)}
        />
      </FormDialog>

      <FormDialog
        open={!!editFeature}
        onOpenChange={(o) => {
          if (!o) setEditFeature(null)
        }}
        title="Edit Feature"
      >
        {editFeature && (
          <FeatureForm
            defaultValues={editFeature}
            canManageStatus={canManageStatus}
            isSubmitting={upsert.isPending}
            onSubmit={(d) => handleSubmit(d, editFeature.id)}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null)
        }}
        title="Delete Feature"
        description="This will permanently delete the feature along with its votes and comments."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteFeature.isPending}
        onConfirm={() =>
          deleteFeature.mutate(deleteId!, { onSuccess: () => setDeleteId(null) })
        }
      />
    </div>
  )
}
