'use client'

import { useMemo } from 'react'
import type { FieldError } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { NO_ASSIGNEE_VALUE } from '@/lib/constants'
import type { ITeamMember } from '@/services/team/use-get-team'

interface FeatureAssigneeFieldProps {
  members: ITeamMember[]
  assigneeId: string
  onChange: (id: string) => void
  error?: FieldError
  label?: string
  triggerClassName?: string
}

export function FeatureAssigneeField({
  members,
  assigneeId,
  onChange,
  error,
  label = 'Assignee',
  triggerClassName = 'w-full',
}: FeatureAssigneeFieldProps) {
  const items = useMemo(
    () => ({
      [NO_ASSIGNEE_VALUE]: 'Unassigned',
      ...Object.fromEntries(members.map((m) => [m.id, m.full_name])),
    }),
    [members]
  )

  return (
    <FormFieldWrapper label={label} error={error}>
      <Select
        items={items}
        value={assigneeId || NO_ASSIGNEE_VALUE}
        onValueChange={(v) => onChange(!v || v === NO_ASSIGNEE_VALUE ? '' : v)}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder="Select assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_ASSIGNEE_VALUE}>Unassigned</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  )
}
