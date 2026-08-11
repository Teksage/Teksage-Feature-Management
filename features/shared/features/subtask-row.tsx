'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { SUBTASK_STATUSES } from '@/lib/constants'
import type { ISubtask } from '@/services/subtasks/use-get-subtasks'
import type { SubtaskStatus } from '@/types/supabase.types'
import { cn } from '@/utils/cn'

interface SubtaskRowProps {
  subtask: ISubtask
  canManage: boolean
  onStatusChange: (id: string, title: string, status: SubtaskStatus, previous: SubtaskStatus) => void
  onDelete: (id: string, title: string) => void
}

export function SubtaskRow({ subtask, canManage, onStatusChange, onDelete }: SubtaskRowProps) {
  const isComplete = subtask.status === 'Completed'

  return (
    <li className="bg-muted/30 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5 sm:gap-3">
      {canManage ? (
        <Select
          value={subtask.status}
          onValueChange={(v) => {
            if (!v) return
            onStatusChange(subtask.id, subtask.title, v as SubtaskStatus, subtask.status)
          }}
        >
          <SelectTrigger className="h-8 w-[8.5rem] shrink-0 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUBTASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <StatusBadge status={subtask.status} className="shrink-0 text-xs" />
      )}

      <span
        className={cn(
          'min-w-0 flex-1 text-sm',
          isComplete && 'text-muted-foreground line-through'
        )}
      >
        {subtask.title}
      </span>

      {canManage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => onDelete(subtask.id, subtask.title)}
        >
          <Trash2 className="text-destructive h-3.5 w-3.5" />
        </Button>
      )}
    </li>
  )
}
