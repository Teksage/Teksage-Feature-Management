'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, LayoutGrid, List, Kanban } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { PageHeader } from '@/components/shared/layout/page-header'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureForm } from './feature-form'
import { FeatureBoardFilters, type FeatureBoardFilterValues } from './feature-board-filters'
import { FeatureListView } from './feature-list-view'
import { KanbanBoardColumns } from './kanban-board-columns'
import { BOARD_TAB_ACCENT } from './board-tab-accent'
import { cn } from '@/utils/cn'
import {
  useGetFeatures,
  useUpsertFeature,
  useDeleteFeature,
  useMoveFeature,
} from '@/services/features'
import { useAuthStore } from '@/store/auth-store'
import { canEditFeatureMeta } from '@/utils/feature-permissions'
import { FEATURE_BOARD_TABS, type FeatureBoardTab } from '@/lib/constants'
import { matchesBoardTab, statusForTab } from '@/services/features/features.types'
import type { FeaturePlatform, FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from '@/services/features/features.types'

interface KanbanBoardProps {
  basePath: string
}

const EMPTY_FILTERS: FeatureBoardFilterValues = {
  search: '',
  priority: undefined,
  platform: undefined,
  categoryId: undefined,
  assigneeId: undefined,
}

function defaultPlatformForTab(tab: FeatureBoardTab): FeaturePlatform {
  return tab === 'Web' ? 'Website' : 'App'
}

export function KanbanBoard({ basePath }: KanbanBoardProps) {
  const { user } = useAuthStore()
  const isAdmin = canEditFeatureMeta(user)
  const [tab, setTab] = useState<FeatureBoardTab>('Web')
  const [view, setView] = useState<'board' | 'list'>('board')
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
    assigneeId: filters.assigneeId,
  })

  const upsert = useUpsertFeature()
  const deleteFeature = useDeleteFeature()
  const moveFeature = useMoveFeature()

  const tabFeatures = useMemo(
    () => allFeatures.filter((f) => matchesBoardTab(f, tab)),
    [allFeatures, tab]
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="flex h-full flex-col gap-5">
      <PageHeader
        icon={Kanban}
        title="Features"
        description="Track Web and App delivery on separate boards. Drag cards to update status."
        footer={<FeatureBoardFilters values={filters} onChange={setFilters} />}
      >
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <div className="bg-muted/80 inline-flex rounded-xl border p-1 shadow-sm">
            <Button
              type="button"
              variant={view === 'board' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-lg px-3"
              onClick={() => setView('board')}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </Button>
            <Button
              type="button"
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-lg px-3"
              onClick={() => setView('list')}
            >
              <List className="h-3.5 w-3.5" /> List
            </Button>
          </div>
          <span className="text-muted-foreground bg-muted/50 rounded-full border px-3 py-1 text-xs font-medium tabular-nums">
            {tabFeatures.length} feature{tabFeatures.length === 1 ? '' : 's'}
          </span>
        </div>
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
          <TabsContent key={t.id} value={t.id} className="min-h-0 flex-1 overflow-auto pb-4">
            {tab === t.id &&
              (view === 'list' ? (
                <FeatureListView features={tabFeatures} basePath={basePath} />
              ) : (
                <KanbanBoardColumns
                  tab={tab}
                  features={tabFeatures}
                  basePath={basePath}
                  onAdd={(status) => {
                    setCreateStatus(status)
                    setCreateOpen(true)
                  }}
                  onEdit={setEditFeature}
                  onDelete={setDeleteId}
                  onDropFeature={(featureId, status) => {
                    const f = allFeatures.find((x) => x.id === featureId)
                    if (!f || statusForTab(f, tab) === status) return
                    moveFeature.mutate({ id: featureId, status, tab })
                  }}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>

      <FormDialog
        open={createOpen}
        onOpenChange={(o) => {
          if (!o) setCreateOpen(false)
        }}
        title="New Feature"
        fieldCount={8}
      >
        <FeatureForm
          defaultValues={{ status: createStatus, platform: defaultPlatformForTab(tab) }}
          canManageStatus={isAdmin}
          isSubmitting={upsert.isPending}
          onSubmit={async (d) => {
            await upsert.mutateAsync(d)
            setCreateOpen(false)
          }}
        />
      </FormDialog>

      {isAdmin && (
        <FormDialog
          open={!!editFeature}
          onOpenChange={(o) => {
            if (!o) setEditFeature(null)
          }}
          title="Edit Feature"
          fieldCount={8}
        >
          {editFeature && (
            <FeatureForm
              defaultValues={editFeature}
              canManageStatus
              isSubmitting={upsert.isPending}
              onSubmit={async (d) => {
                await upsert.mutateAsync({ ...d, id: editFeature.id })
                setEditFeature(null)
              }}
            />
          )}
        </FormDialog>
      )}

      {isAdmin && (
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
      )}
    </div>
  )
}
