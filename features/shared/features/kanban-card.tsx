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
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { ReleaseCountdown } from '@/components/shared/data-display/release-countdown'
import { cn } from '@/utils/cn'
import { useToggleVote } from '@/services/votes/use-toggle-vote'
import { KANBAN_DRAG_TYPE } from '@/lib/constants'
import type { IFeatureEntity } from '@/services/features/features.types'

interface KanbanCardProps {
  feature: IFeatureEntity
  basePath: string
  canDrag: boolean
  onEdit: (f: IFeatureEntity) => void
  onDelete: (id: string) => void
}

export function KanbanCard({
  feature: f,
  basePath,
  canDrag,
  onEdit,
  onDelete,
}: KanbanCardProps) {
  const router = useRouter()
  const dragged = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const { mutate: toggleVote, isPending: votePending } = useToggleVote()

  function handleDragStart(e: React.DragEvent) {
    if (!canDrag) return
    dragged.current = true
    setIsDragging(true)
    e.dataTransfer.setData(KANBAN_DRAG_TYPE, f.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    setIsDragging(false)
    // Delay reset so click after drop is ignored
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
        'bg-card group relative flex flex-col gap-2.5 rounded-xl border p-3',
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

      <div className="pl-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{f.title}</p>
        {f.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{f.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between pl-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={f.priority} />
          {f.category_name && (
            <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-[10px]">
              {f.category_name}
            </span>
          )}
          {f.platform === 'Both' && (
            <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-[10px]">Both</span>
          )}
          <ReleaseCountdown date={f.target_release} />
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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

          {canDrag && (
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
