'use client'

import Link from 'next/link'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { usePagination } from '@/hooks/use-pagination'
import { formatDate } from '@/utils/format'
import type { IFeatureEntity } from '@/services/features/features.types'

interface FeatureListViewProps {
  features: IFeatureEntity[]
  basePath: string
}

export function FeatureListView({ features, basePath }: FeatureListViewProps) {
  const pagination = usePagination(25)
  const pageItems = pagination.paginate(features)
  const state = pagination.getState(features.length)

  const columns: Column<IFeatureEntity>[] = [
    {
      key: 'title',
      header: 'Title',
      cell: (row) => (
        <Link href={`${basePath}/${row.id}`} className="hover:text-primary font-medium">
          {row.title}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (row) => <StatusBadge status={row.priority} />,
    },
    {
      key: 'owner',
      header: 'Assignee',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">
          {row.assignee_full_name ?? 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{row.category_name ?? '—'}</span>
      ),
    },
    {
      key: 'votes',
      header: 'Votes',
      className: 'tabular-nums',
      cell: (row) => row.vote_count,
    },
    {
      key: 'release',
      header: 'Release',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">
          {row.target_release ? formatDate(row.target_release) : '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-2">
      <div className="glass-panel rounded-xl border p-3 shadow-sm">
        <DataTable data={pageItems} columns={columns} keyExtractor={(r) => r.id} />
      </div>
      <PaginationControls
        page={state.page}
        totalPages={state.totalPages}
        canPrev={state.canPrev}
        canNext={state.canNext}
        onPrev={() => pagination.goTo(state.page - 1, features.length)}
        onNext={() => pagination.goTo(state.page + 1, features.length)}
        totalItems={features.length}
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  )
}
