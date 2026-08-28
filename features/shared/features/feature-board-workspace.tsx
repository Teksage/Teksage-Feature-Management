'use client'

import { FeatureListView } from './feature-list-view'
import { KanbanBoardColumns } from './kanban-board-columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BOARD_TAB_ACCENT } from './board-tab-accent'
import { cn } from '@/utils/cn'
import { FEATURE_BOARD_TABS, type FeatureBoardTab } from '@/lib/constants'
import { matchesBoardTab, statusForTab } from '@/services/features/features.types'
import type { FeatureDomain, FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from '@/services/features/features.types'

interface FeatureBoardWorkspaceProps {
  domain: FeatureDomain
  tab: FeatureBoardTab
  onTabChange: (tab: FeatureBoardTab) => void
  view: 'board' | 'list'
  features: IFeatureEntity[]
  basePath: string
  onAdd: (status: FeatureStatus) => void
  onEdit: (f: IFeatureEntity) => void
  onDelete: (id: string) => void
  onDropFeature: (featureId: string, status: FeatureStatus, tab?: FeatureBoardTab) => void
}

export function FeatureBoardWorkspace({
  domain,
  tab,
  onTabChange,
  view,
  features,
  basePath,
  onAdd,
  onEdit,
  onDelete,
  onDropFeature,
}: FeatureBoardWorkspaceProps) {
  const isMarketing = domain === 'marketing'
  const visible = isMarketing ? features : features.filter((f) => matchesBoardTab(f, tab))

  const board = view === 'list' ? (
    <FeatureListView features={visible} basePath={basePath} />
  ) : (
    <div className="overflow-x-auto pb-2">
      <KanbanBoardColumns
        tab={isMarketing ? 'Web' : tab}
        features={visible}
        basePath={basePath}
        byPrimaryStatus={isMarketing}
        addLabel={isMarketing ? 'Add plan' : undefined}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDropFeature={(id, status) => onDropFeature(id, status, isMarketing ? undefined : tab)}
      />
    </div>
  )

  if (isMarketing) return board

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        if (v === 'Web' || v === 'App') onTabChange(v)
      }}
      className="flex flex-col gap-3"
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
        <TabsContent key={t.id} value={t.id} className="mt-0 outline-none">
          {tab === t.id ? board : null}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export function countVisibleFeatures(
  features: IFeatureEntity[],
  domain: FeatureDomain,
  tab: FeatureBoardTab
) {
  if (domain === 'marketing') return features.length
  return features.filter((f) => matchesBoardTab(f, tab)).length
}

export function currentTabStatus(feature: IFeatureEntity, tab: FeatureBoardTab, single: boolean) {
  return single ? feature.status : statusForTab(feature, tab)
}
