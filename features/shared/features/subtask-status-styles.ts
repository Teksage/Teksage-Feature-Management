import type { SubtaskStatus } from '@/types/supabase.types'
import { cn } from '@/utils/cn'

export const SUBTASK_STATUS_STYLES: Record<
  SubtaskStatus,
  { label: string; trigger: string; row: string; dot: string; item: string }
> = {
  Idea: {
    label: 'Idea',
    trigger: 'bg-muted/80 text-muted-foreground border-border hover:bg-muted',
    row: 'border-l-muted-foreground/40',
    dot: 'bg-muted-foreground/50',
    item: 'text-muted-foreground',
  },
  'In Progress': {
    label: 'In Progress',
    trigger: 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/15',
    row: 'border-l-warning',
    dot: 'bg-warning',
    item: 'text-warning',
  },
  Completed: {
    label: 'Completed',
    trigger: 'bg-success/10 text-success border-success/30 hover:bg-success/15',
    row: 'border-l-success',
    dot: 'bg-success',
    item: 'text-success',
  },
}

export function subtaskStatusStyle(status: SubtaskStatus) {
  return SUBTASK_STATUS_STYLES[status]
}

export function subtaskStatusTriggerClass(status: SubtaskStatus, className?: string) {
  return cn(
    'h-9 w-[9.5rem] shrink-0 border font-medium transition-colors duration-200',
    SUBTASK_STATUS_STYLES[status].trigger,
    className
  )
}
