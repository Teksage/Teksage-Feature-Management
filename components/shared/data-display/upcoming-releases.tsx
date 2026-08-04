'use client'

import Link from 'next/link'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { ReleaseCountdown } from '@/components/shared/data-display/release-countdown'
import { formatDate, daysUntil } from '@/utils/format'
import type { IFeatureEntity } from '@/services/features/features.types'

interface UpcomingReleasesProps {
  features: IFeatureEntity[]
  basePath: string
}

export function UpcomingReleases({ features, basePath }: UpcomingReleasesProps) {
  const scheduled = features
    .filter((f) => f.target_release && f.status !== 'Completed')
    .sort((a, b) => {
      const da = daysUntil(a.target_release!) ?? Number.MAX_SAFE_INTEGER
      const db = daysUntil(b.target_release!) ?? Number.MAX_SAFE_INTEGER
      return da - db
    })
    .slice(0, 6)

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Upcoming Releases</h2>
      {scheduled.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No release dates set. Add a target date when creating a feature.
        </p>
      ) : (
        <ul className="space-y-2">
          {scheduled.map((f) => (
            <li
              key={f.id}
              className="bg-card flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
            >
              <div className="min-w-0 space-y-1">
                <Link
                  href={`${basePath}/${f.id}`}
                  className="hover:text-primary block truncate text-sm font-medium"
                >
                  {f.title}
                </Link>
                <p className="text-muted-foreground text-xs">{formatDate(f.target_release!)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={f.status} />
                <ReleaseCountdown date={f.target_release} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
