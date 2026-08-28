'use client'

import { useMemo } from 'react'
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
import type { FeatureBoardFilterValues } from './feature-board-filters'

const ALL = 'all'

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground text-[11px] font-medium">{label}</label>
      {children}
    </div>
  )
}

interface FeatureBoardFilterFieldsProps {
  values: FeatureBoardFilterValues
  hidePlatform: boolean
  onPatch: (partial: Partial<FeatureBoardFilterValues>) => void
}

export function FeatureBoardFilterFields({
  values,
  hidePlatform,
  onPatch,
}: FeatureBoardFilterFieldsProps) {
  const { data: categories = [] } = useGetCategories()
  const { data: members = [] } = useGetTeam()

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

  return (
    <div
      className={
        hidePlatform
          ? 'grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3'
          : 'grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4'
      }
    >
      <FilterField label="Priority">
        <Select
          items={priorityItems}
          value={values.priority ?? ALL}
          onValueChange={(v) =>
            onPatch({ priority: !v || v === ALL ? undefined : (v as FeaturePriority) })
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

      {hidePlatform ? null : (
        <FilterField label="Platform">
          <Select
            items={platformItems}
            value={values.platform ?? ALL}
            onValueChange={(v) =>
              onPatch({ platform: !v || v === ALL ? undefined : (v as FeaturePlatform) })
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
      )}

      <FilterField label="Category">
        <Select
          items={categoryItems}
          value={values.categoryId ?? ALL}
          onValueChange={(v) => onPatch({ categoryId: !v || v === ALL ? undefined : v })}
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
          onValueChange={(v) => onPatch({ assigneeId: !v || v === ALL ? undefined : v })}
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
  )
}
