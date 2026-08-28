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
  byPrimaryStatus?: boolean
  addLabel?: string
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
  byPrimaryStatus = false,
  addLabel,
}: KanbanBoardColumnsProps) {
  return (
    <div className="flex min-w-max gap-3">
      {FEATURE_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tab={tab}
          features={features.filter((f) =>
            byPrimaryStatus ? f.status === status : statusForTab(f, tab) === status
          )}
          basePath={basePath}
          addLabel={addLabel}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onDropFeature={onDropFeature}
        />
      ))}
    </div>
  )
}
