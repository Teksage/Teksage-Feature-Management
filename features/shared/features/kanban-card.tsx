'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, ThumbsUp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useToggleVote } from '@/services/votes/use-toggle-vote'
import { useAuthStore } from '@/store/auth-store'
import { canDragFeature, canEditFeatureMeta } from '@/utils/feature-permissions'
import { KANBAN_DRAG_TYPE } from '@/lib/constants'
import type { IFeatureEntity } from '@/services/features/features.types'

interface KanbanCardProps {
  feature: IFeatureEntity
  basePath: string
  onEdit: (f: IFeatureEntity) => void
  onDelete: (id: string) => void
}

export function KanbanCard({ feature: f, basePath, onEdit, onDelete }: KanbanCardProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const dragged = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const { mutate: toggleVote, isPending: votePending } = useToggleVote()

  const canDrag = canDragFeature(user, f)
  const canEdit = canEditFeatureMeta(user)

  function handleDragStart(e: React.DragEvent) {
    if (!canDrag) return
    dragged.current = true
    setIsDragging(true)
    e.dataTransfer.setData(KANBAN_DRAG_TYPE, f.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    setIsDragging(false)
    requestAnimationFrame(() => {
      dragged.current = false
    })
  }

  function handleClick() {
    if (dragged.current) return
    router.push(`${basePath}/${f.id}`)
  }

  return (
    <div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={cn(
        'bg-card group relative flex flex-col gap-2 rounded-xl border p-3',
        'shadow-card hover:shadow-dropdown hover:ring-primary/15 transition-all hover:ring-1',
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        isDragging && 'opacity-40 ring-1 ring-primary'
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 h-full w-1 rounded-l-xl',
          f.priority === 'Critical' && 'bg-destructive',
          f.priority === 'High' && 'bg-warning',
          f.priority === 'Medium' && 'bg-info',
          f.priority === 'Low' && 'bg-muted-foreground/30'
        )}
      />

      <p className="line-clamp-2 pl-1 text-sm font-semibold leading-snug">{f.title}</p>

      <div className="flex items-center justify-between gap-2 pl-1">
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-[11px]">
          <span className="truncate">{f.assignee_full_name ?? 'Unassigned'}</span>
          {f.subtask_total > 0 && (
            <span className="shrink-0 tabular-nums">
              {f.subtask_done}/{f.subtask_total}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            disabled={votePending}
            onClick={() => toggleVote({ featureId: f.id, hasVoted: f.has_voted })}
            className={cn('h-6 gap-1 px-1.5 text-xs', f.has_voted && 'text-primary')}
          >
            <ThumbsUp className={cn('h-3 w-3', f.has_voted && 'fill-primary')} />
            <span className="tabular-nums">{f.vote_count}</span>
          </Button>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:bg-muted focus-visible:ring-ring inline-flex h-6 w-6 items-center justify-center rounded-md opacity-0 outline-none transition-opacity group-hover:opacity-100 focus-visible:ring-1">
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="sr-only">Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onEdit(f)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(f.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
