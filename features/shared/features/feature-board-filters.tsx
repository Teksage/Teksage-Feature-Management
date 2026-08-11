'use client'

import { useMemo } from 'react'
import { Filter, X } from 'lucide-react'
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
import { useGetTeam } from '@/services/team/use-get-team'
import { FEATURE_PLATFORMS, FEATURE_PRIORITIES } from '@/lib/constants'
import type { FeaturePlatform, FeaturePriority } from '@/types/supabase.types'

const ALL = 'all'

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
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground text-[11px] font-medium">{label}</label>
      {children}
    </div>
  )
}

export function FeatureBoardFilters({ values, onChange }: FeatureBoardFiltersProps) {
  const { data: categories = [] } = useGetCategories()
  const { data: members = [] } = useGetTeam()
  const hasActive =
    !!values.search ||
    !!values.priority ||
    !!values.platform ||
    !!values.categoryId ||
    !!values.assigneeId

  const priorityItems = useMemo(
    () => ({
      [ALL]: 'All priorities',
      ...Object.fromEntries(FEATURE_PRIORITIES.map((p) => [p, p])),
    }),
    []
  )
  const platformItems = useMemo(
    () => ({
      [ALL]: 'All platforms',
      ...Object.fromEntries(
        FEATURE_PLATFORMS.map((p) => [p, p === 'Both' ? 'Both (Web + App)' : p])
      ),
    }),
    []
  )
  const categoryItems = useMemo(
    () => ({
      [ALL]: 'All categories',
      ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
    }),
    [categories]
  )
  const assigneeItems = useMemo(
    () => ({
      [ALL]: 'All assignees',
      ...Object.fromEntries(members.map((m) => [m.id, m.full_name])),
    }),
    [members]
  )

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

      <FilterField label="Search">
        <SearchBar
          value={values.search}
          onChange={(search) => patch({ search })}
          placeholder="Search by feature title…"
          className="w-full"
        />
      </FilterField>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <FilterField label="Priority">
          <Select
            items={priorityItems}
            value={values.priority ?? ALL}
            onValueChange={(v) =>
              patch({ priority: !v || v === ALL ? undefined : (v as FeaturePriority) })
            }
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All priorities" />
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
        </FilterField>

        <FilterField label="Platform">
          <Select
            items={platformItems}
            value={values.platform ?? ALL}
            onValueChange={(v) =>
              patch({ platform: !v || v === ALL ? undefined : (v as FeaturePlatform) })
            }
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All platforms" />
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
        </FilterField>

        <FilterField label="Category">
          <Select
            items={categoryItems}
            value={values.categoryId ?? ALL}
            onValueChange={(v) => patch({ categoryId: !v || v === ALL ? undefined : v })}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All categories" />
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
        </FilterField>

        <FilterField label="Assignee">
          <Select
            items={assigneeItems}
            value={values.assigneeId ?? ALL}
            onValueChange={(v) => patch({ assigneeId: !v || v === ALL ? undefined : v })}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All assignees</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      </div>
    </div>
  )
}
