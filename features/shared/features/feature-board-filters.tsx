'use client'

import { Filter, X } from 'lucide-react'
import { SearchBar } from '@/components/shared/forms/search-bar'
import { Button } from '@/components/ui/button'
import { FeatureBoardFilterFields } from './feature-board-filter-fields'
import type { FeaturePlatform, FeaturePriority } from '@/types/supabase.types'

export interface FeatureBoardFilterValues {
  search: string
  priority: FeaturePriority | undefined
  platform: FeaturePlatform | undefined
  categoryId: string | undefined
  assigneeId: string | undefined
}

interface FeatureBoardFiltersProps {
  values: FeatureBoardFilterValues
  onChange: (next: FeatureBoardFilterValues) => void
  hidePlatform?: boolean
  searchPlaceholder?: string
}

export function FeatureBoardFilters({
  values,
  onChange,
  hidePlatform = false,
  searchPlaceholder,
}: FeatureBoardFiltersProps) {
  const hasActive =
    !!values.search ||
    !!values.priority ||
    (!hidePlatform && !!values.platform) ||
    !!values.categoryId ||
    !!values.assigneeId

  function patch(partial: Partial<FeatureBoardFilterValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-3.5 w-3.5" />
          <span className="text-xs font-semibold tracking-wide uppercase">Filters</span>
        </div>
        {hasActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-8 gap-1.5 px-2"
            onClick={() =>
              onChange({
                search: '',
                priority: undefined,
                platform: undefined,
                categoryId: undefined,
                assigneeId: undefined,
              })
            }
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-muted-foreground text-[11px] font-medium">Search</label>
        <SearchBar
          value={values.search}
          onChange={(search) => patch({ search })}
          placeholder={searchPlaceholder ?? 'Search by feature title…'}
          className="w-full"
        />
      </div>

      <FeatureBoardFilterFields values={values} hidePlatform={hidePlatform} onPatch={patch} />
    </div>
  )
}
