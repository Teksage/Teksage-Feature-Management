'use client'

import Link from 'next/link'
import { Calendar, ThumbsUp } from 'lucide-react'
import { ListRowCard } from '@/components/shared/data-display/list-row-card'
import { SectionPanel } from '@/components/shared/data-display/section-panel'
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
    <SectionPanel title="Upcoming Releases" icon={Calendar}>
      {scheduled.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No release dates set. Add a target date when creating a feature.
        </p>
      ) : (
        <ul className="space-y-2">
          {scheduled.map((f) => (
            <ListRowCard key={f.id}>
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
            </ListRowCard>
          ))}
        </ul>
      )}
    </SectionPanel>
  )
}

interface FeatureLinkListProps {
  features: Array<{
    id: string
    title: string
    status: IFeatureEntity['status']
    vote_count?: number
    target_release?: string | null
  }>
  basePath: string
  showVotes?: boolean
  showDate?: boolean
}

export function FeatureLinkList({
  features,
  basePath,
  showVotes,
  showDate,
}: FeatureLinkListProps) {
  return (
    <ul className="space-y-2">
      {features.map((f) => (
        <ListRowCard key={f.id}>
          <Link
            href={`${basePath}/${f.id}`}
            className="hover:text-primary min-w-0 truncate text-sm font-medium"
          >
            {f.title}
          </Link>
          <div className="ml-2 flex shrink-0 items-center gap-2">
            <StatusBadge status={f.status} />
            {showVotes && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
                <ThumbsUp className="h-3 w-3" />
                {f.vote_count}
              </span>
            )}
            {showDate && f.target_release && (
              <span className="text-muted-foreground hidden text-xs sm:inline">
                {formatDate(f.target_release)}
              </span>
            )}
          </div>
        </ListRowCard>
      ))}
    </ul>
  )
}
