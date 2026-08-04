'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { KanbanCard } from './kanban-card'
import { BOARD_TAB_ACCENT } from './board-tab-accent'
import { KANBAN_DRAG_TYPE, type FeatureBoardTab } from '@/lib/constants'
import type { FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from '@/services/features/features.types'

const COLUMN_STYLES: Record<FeatureStatus, { header: string; dot: string }> = {
  Idea: { header: 'border-t-muted-foreground/40', dot: 'bg-muted-foreground/50' },
  Planned: { header: 'border-t-info', dot: 'bg-info' },
  'In Progress': { header: 'border-t-warning', dot: 'bg-warning' },
  Completed: { header: 'border-t-success', dot: 'bg-success' },
}

interface KanbanColumnProps {
  status: FeatureStatus
  tab: FeatureBoardTab
  features: IFeatureEntity[]
  basePath: string
  canManageStatus: boolean
  onAdd: (status: FeatureStatus) => void
  onEdit: (f: IFeatureEntity) => void
  onDelete: (id: string) => void
  onDropFeature: (featureId: string, status: FeatureStatus) => void
}

export function KanbanColumn({
  status,
  tab,
  features,
  basePath,
  canManageStatus,
  onAdd,
  onEdit,
  onDelete,
  onDropFeature,
}: KanbanColumnProps) {
  const style = COLUMN_STYLES[status]
  const accent = BOARD_TAB_ACCENT[tab]
  const [isOver, setIsOver] = useState(false)

  function handleDragOver(e: React.DragEvent) {
    if (!canManageStatus) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsOver(false)
    const featureId = e.dataTransfer.getData(KANBAN_DRAG_TYPE)
    if (!featureId) return
    onDropFeature(featureId, status)
  }

  return (
    <div
      className={cn(
        'flex w-72 shrink-0 flex-col gap-3 rounded-xl p-2 transition-colors lg:w-64 xl:w-72',
        accent.column,
        isOver && accent.dropTarget
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          'bg-card flex items-center justify-between rounded-xl border border-t-2 px-3 py-2.5',
          style.header,
          accent.headerEdge
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', style.dot)} />
          <span className="text-sm font-semibold">{status}</span>
        </div>
        <Badge variant="outline" className="h-5 min-w-[20px] px-1.5 text-[11px] tabular-nums">
          {features.length}
        </Badge>
      </div>

      <div className="flex min-h-16 flex-col gap-2">
        {features.map((f) => (
          <KanbanCard
            key={f.id}
            feature={f}
            basePath={basePath}
            canDrag={canManageStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground justify-start gap-1.5 rounded-xl border border-dashed"
        onClick={() => onAdd(status)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add feature
      </Button>
    </div>
  )
}
