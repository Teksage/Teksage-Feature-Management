'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUBTASK_STATUSES } from '@/lib/constants'
import type { SubtaskStatus } from '@/types/supabase.types'
import { cn } from '@/utils/cn'
import { subtaskStatusStyle, subtaskStatusTriggerClass } from './subtask-status-styles'

interface SubtaskStatusSelectProps {
  value: SubtaskStatus
  onChange: (status: SubtaskStatus) => void
  disabled?: boolean
}

export function SubtaskStatusSelect({ value, onChange, disabled }: SubtaskStatusSelectProps) {
  const current = subtaskStatusStyle(value)

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(v) => {
        if (v) onChange(v as SubtaskStatus)
      }}
    >
      <SelectTrigger className={subtaskStatusTriggerClass(value)}>
        <span className={cn('mr-1.5 h-2 w-2 shrink-0 rounded-full', current.dot)} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUBTASK_STATUSES.map((status) => {
          const style = subtaskStatusStyle(status)
          return (
            <SelectItem key={status} value={status}>
              <span className="flex items-center gap-2">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', style.dot)} />
                <span className={cn('font-medium', style.item)}>{style.label}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
