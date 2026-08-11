'use client'

import { CheckCircle2, Circle, Lightbulb, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { SubtaskStatusSelect } from './subtask-status-select'
import { subtaskStatusStyle } from './subtask-status-styles'
import type { ISubtask } from '@/services/subtasks/use-get-subtasks'
import type { SubtaskStatus } from '@/types/supabase.types'
import { cn } from '@/utils/cn'

interface SubtaskRowProps {
  subtask: ISubtask
  canManage: boolean
  onStatusChange: (id: string, title: string, status: SubtaskStatus, previous: SubtaskStatus) => void
  onDelete: (id: string, title: string) => void
}

function StatusIcon({ status }: { status: SubtaskStatus }) {
  if (status === 'Completed') return <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
  if (status === 'In Progress') return <Circle className="text-warning h-4 w-4 shrink-0" />
  return <Lightbulb className="text-muted-foreground h-4 w-4 shrink-0" />
}

export function SubtaskRow({ subtask, canManage, onStatusChange, onDelete }: SubtaskRowProps) {
  const isComplete = subtask.status === 'Completed'
  const tone = subtaskStatusStyle(subtask.status)

  return (
    <li
      className={cn(
        'group bg-card flex flex-wrap items-center gap-3 rounded-xl border border-l-4 px-3 py-3 shadow-sm transition-all duration-200',
        'hover:shadow-md',
        tone.row,
        isComplete && 'bg-muted/20'
      )}
    >
      {!canManage && <StatusIcon status={subtask.status} />}

      {canManage ? (
        <SubtaskStatusSelect
          value={subtask.status}
          onChange={(status) =>
            onStatusChange(subtask.id, subtask.title, status, subtask.status)
          }
        />
      ) : (
        <StatusBadge status={subtask.status} className="shrink-0 text-xs" />
      )}

      <span
        className={cn(
          'min-w-0 flex-1 text-sm font-medium',
          isComplete && 'text-muted-foreground line-through decoration-success/40'
        )}
      >
        {subtask.title}
      </span>

      {canManage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
          onClick={() => onDelete(subtask.id, subtask.title)}
        >
          <Trash2 className="text-destructive h-4 w-4" />
        </Button>
      )}
    </li>
  )
}
