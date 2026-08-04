'use client'

import { X } from 'lucide-react'
import { SearchBar } from '@/components/shared/forms/search-bar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetCategories } from '@/services/categories/use-get-categories'
import { FEATURE_PLATFORMS, FEATURE_PRIORITIES } from '@/lib/constants'
import type { FeaturePlatform, FeaturePriority } from '@/types/supabase.types'

const ALL = 'all'

export interface FeatureBoardFilterValues {
  search: string
  priority: FeaturePriority | undefined
  platform: FeaturePlatform | undefined
  categoryId: string | undefined
}

interface FeatureBoardFiltersProps {
  values: FeatureBoardFilterValues
  onChange: (next: FeatureBoardFilterValues) => void
}

export function FeatureBoardFilters({ values, onChange }: FeatureBoardFiltersProps) {
  const { data: categories = [] } = useGetCategories()
  const hasActive =
    !!values.search || !!values.priority || !!values.platform || !!values.categoryId

  function patch(partial: Partial<FeatureBoardFilterValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBar
        value={values.search}
        onChange={(search) => patch({ search })}
        placeholder="Search features…"
        className="w-44"
      />

      <Select
        value={values.priority ?? ALL}
        onValueChange={(v) =>
          patch({ priority: !v || v === ALL ? undefined : (v as FeaturePriority) })
        }
      >
        <SelectTrigger className="h-9 w-[130px]" size="sm">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {FEATURE_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={values.platform ?? ALL}
        onValueChange={(v) =>
          patch({ platform: !v || v === ALL ? undefined : (v as FeaturePlatform) })
        }
      >
        <SelectTrigger className="h-9 w-[130px]" size="sm">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All platforms</SelectItem>
          {FEATURE_PLATFORMS.map((p) => (
            <SelectItem key={p} value={p}>
              {p === 'Both' ? 'Both (Web + App)' : p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={values.categoryId ?? ALL}
        onValueChange={(v) => patch({ categoryId: !v || v === ALL ? undefined : v })}
      >
        <SelectTrigger className="h-9 w-[140px]" size="sm">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActive && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1 px-2"
          onClick={() =>
            onChange({
              search: '',
              priority: undefined,
              platform: undefined,
              categoryId: undefined,
            })
          }
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
