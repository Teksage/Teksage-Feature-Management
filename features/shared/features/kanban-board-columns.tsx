'use client'

import { KanbanColumn } from './kanban-column'
import { FEATURE_STATUSES, type FeatureBoardTab } from '@/lib/constants'
import { statusForTab } from '@/services/features/features.types'
import type { FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from '@/services/features/features.types'

interface KanbanBoardColumnsProps {
  tab: FeatureBoardTab
  features: IFeatureEntity[]
  basePath: string
  onAdd: (status: FeatureStatus) => void
  onEdit: (f: IFeatureEntity) => void
  onDelete: (id: string) => void
  onDropFeature: (featureId: string, status: FeatureStatus) => void
}

export function KanbanBoardColumns({
  tab,
  features,
  basePath,
  onAdd,
  onEdit,
  onDelete,
  onDropFeature,
}: KanbanBoardColumnsProps) {
  return (
    <div className="flex min-w-max gap-3">
      {FEATURE_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tab={tab}
          features={features.filter((f) => statusForTab(f, tab) === status)}
          basePath={basePath}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onDropFeature={onDropFeature}
        />
      ))}
    </div>
  )
}
