'use client'

import { useMemo } from 'react'
import type { FieldError } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { NO_CATEGORY_VALUE } from '@/lib/constants'
import type { ICategory } from '@/services/categories/use-get-categories'

interface FeatureCategoryFieldProps {
  categories: ICategory[]
  categoryId: string
  newCategory: string
  onCategoryChange: (id: string) => void
  onNewCategoryChange: (name: string) => void
  error?: FieldError
  /** Creating categories is Admin-only at the RLS level. */
  canCreate?: boolean
}

export function FeatureCategoryField({
  categories,
  categoryId,
  newCategory,
  onCategoryChange,
  onNewCategoryChange,
  error,
  canCreate = false,
}: FeatureCategoryFieldProps) {
  // Base UI resolves the trigger label from this map. Without it the raw
  // value (a UUID) is shown until the popup has been opened at least once.
  const items = useMemo(
    () => ({
      [NO_CATEGORY_VALUE]: 'No category',
      ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
    }),
    [categories]
  )

  return (
    <>
      <FormFieldWrapper label="Category" error={error}>
        <Select
          items={items}
          value={categoryId || NO_CATEGORY_VALUE}
          onValueChange={(v) => onCategoryChange(!v || v === NO_CATEGORY_VALUE ? '' : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CATEGORY_VALUE}>No category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      {canCreate && (
        <FormFieldWrapper label="Or create new category" htmlFor="newCategory">
          <Input
            id="newCategory"
            placeholder="e.g. Mobile, Billing…"
            value={newCategory}
            onChange={(e) => onNewCategoryChange(e.target.value)}
          />
        </FormFieldWrapper>
      )}
    </>
  )
}
