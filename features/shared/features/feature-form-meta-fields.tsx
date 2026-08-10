'use client'

import type { FieldErrors, UseFormSetValue } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { FEATURE_STATUSES, FEATURE_PRIORITIES, FEATURE_PLATFORMS } from '@/lib/constants'
import type { FeatureInput } from '@/lib/validations/feature'

interface FeatureFormMetaFieldsProps {
  platform: FeatureInput['platform']
  status: FeatureInput['status']
  priority: FeatureInput['priority']
  canManageStatus: boolean
  errors: FieldErrors<FeatureInput>
  setValue: UseFormSetValue<FeatureInput>
}

export function FeatureFormMetaFields({
  platform,
  status,
  priority,
  canManageStatus,
  errors,
  setValue,
}: FeatureFormMetaFieldsProps) {
  return (
    <>
      <FormFieldWrapper label="Platform" error={errors.platform} required>
        <Select
          value={platform}
          onValueChange={(v) => {
            if (v) setValue('platform', v as FeatureInput['platform'])
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEATURE_PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p === 'Both' ? 'Both (Web + App)' : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      <div className="grid grid-cols-2 gap-3">
        {canManageStatus && (
          <FormFieldWrapper label="Status" error={errors.status} required>
            <Select
              value={status}
              onValueChange={(v) => {
                if (v) setValue('status', v as FeatureInput['status'])
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEATURE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        )}
        <FormFieldWrapper label="Priority" error={errors.priority} required>
          <Select
            value={priority}
            onValueChange={(v) => {
              if (v) setValue('priority', v as FeatureInput['priority'])
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FEATURE_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>
    </>
  )
}
