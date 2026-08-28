'use client'

import { useState } from 'react'
import { AlertTriangle, LayoutGrid, List, Kanban, Megaphone } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { PageHeader } from '@/components/shared/layout/page-header'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { Button } from '@/components/ui/button'
import { FeatureBoardFilters, type FeatureBoardFilterValues } from './feature-board-filters'
import { FeatureBoardWorkspace, countVisibleFeatures, currentTabStatus } from './feature-board-workspace'
import { FeatureBoardDialogs } from './feature-board-dialogs'
import { useGetFeatures, useUpsertFeature, useDeleteFeature, useMoveFeature } from '@/services/features'
import { useAuthStore } from '@/store/auth-store'
import { canEditFeatureMeta } from '@/utils/feature-permissions'
import type { FeatureBoardTab } from '@/lib/constants'
import type { FeatureDomain, FeaturePlatform, FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from '@/services/features/features.types'

interface KanbanBoardProps {
  basePath: string
  domain?: FeatureDomain
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

export function KanbanBoard({ basePath, domain = 'product' }: KanbanBoardProps) {
  const { user } = useAuthStore()
  const isAdmin = canEditFeatureMeta(user)
  const isMarketing = domain === 'marketing'
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
    platform: isMarketing ? undefined : filters.platform,
    categoryId: filters.categoryId,
    assigneeId: filters.assigneeId,
    domain,
  })

  const upsert = useUpsertFeature()
  const deleteFeature = useDeleteFeature()
  const moveFeature = useMoveFeature()
  const visibleCount = countVisibleFeatures(allFeatures, domain, tab)
  const noun = isMarketing ? 'plan' : 'feature'

  if (isLoading) return <PageLoader />

  return (
    <div className="flex flex-col gap-3 pb-6">
      <PageHeader
        dense
        icon={isMarketing ? Megaphone : Kanban}
        title={isMarketing ? 'Marketing plans' : 'Features'}
        description={
          isMarketing
            ? 'Plan campaigns and track progress from idea to done.'
            : 'Track Web and App delivery on separate boards. Drag cards to update status.'
        }
        footer={
          <FeatureBoardFilters
            values={filters}
            onChange={setFilters}
            hidePlatform={isMarketing}
            searchPlaceholder={isMarketing ? 'Search by plan title…' : undefined}
          />
        }
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
            {visibleCount} {noun}
            {visibleCount === 1 ? '' : 's'}
          </span>
        </div>
      </PageHeader>

      {error && (
        <EmptyState
          icon={AlertTriangle}
          title={isMarketing ? "Couldn't load plans" : "Couldn't load features"}
          description={error.message}
        />
      )}

      <FeatureBoardWorkspace
        domain={domain}
        tab={tab}
        onTabChange={setTab}
        view={view}
        features={allFeatures}
        basePath={basePath}
        onAdd={(status) => {
          setCreateStatus(status)
          setCreateOpen(true)
        }}
        onEdit={setEditFeature}
        onDelete={setDeleteId}
        onDropFeature={(featureId, status, boardTab) => {
          const f = allFeatures.find((x) => x.id === featureId)
          if (!f) return
          if (currentTabStatus(f, boardTab ?? tab, isMarketing) === status) return
          moveFeature.mutate({
            id: featureId,
            status,
            tab: boardTab,
            singleBoard: isMarketing,
          })
        }}
      />

      <FeatureBoardDialogs
        isMarketing={isMarketing}
        isAdmin={isAdmin}
        createOpen={createOpen}
        createStatus={createStatus}
        createPlatform={isMarketing ? 'Both' : defaultPlatformForTab(tab)}
        editFeature={editFeature}
        deleteId={deleteId}
        isSubmitting={upsert.isPending}
        isDeleting={deleteFeature.isPending}
        onCreateOpenChange={setCreateOpen}
        onEditClose={() => setEditFeature(null)}
        onDeleteClose={() => setDeleteId(null)}
        onSubmitCreate={async (d) => {
          await upsert.mutateAsync({
            ...d,
            platform: isMarketing ? 'Both' : d.platform,
            domain,
          })
          setCreateOpen(false)
        }}
        onSubmitEdit={async (d, id) => {
          await upsert.mutateAsync({
            ...d,
            id,
            platform: isMarketing ? 'Both' : d.platform,
            domain,
          })
          setEditFeature(null)
        }}
        onConfirmDelete={() =>
          deleteFeature.mutate(deleteId!, { onSuccess: () => setDeleteId(null) })
        }
      />
    </div>
  )
}
