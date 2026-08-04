'use client'

import { Lightbulb, CheckCircle2, BarChart3, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/layout/page-header'
import { StatsCard } from '@/components/shared/data-display/stats-card'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { UpcomingReleases } from '@/components/shared/data-display/upcoming-releases'
import { formatDate } from '@/utils/format'
import { useDashboardStats } from '@/services/dashboard/use-dashboard-stats'
import { ROUTES } from '@/lib/constants'

export function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) return <PageLoader />
  if (!stats) return null

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of Teksage feature activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Total Features" value={stats.totalFeatures} icon={Lightbulb} variant="primary" />
        <StatsCard title="In Progress" value={stats.byStatus['In Progress'] ?? 0} icon={BarChart3} variant="warning" />
        <StatsCard title="Completed" value={stats.byStatus['Completed'] ?? 0} icon={CheckCircle2} variant="success" />
        <StatsCard title="Ideas" value={stats.byStatus['Idea'] ?? 0} icon={Lightbulb} />
        <StatsCard title="Overdue" value={stats.overdueCount} icon={AlertTriangle} variant="destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingReleases features={stats.allFeatures} basePath={ROUTES.admin.features} />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Top Voted Features</h2>
          <ul className="space-y-2">
            {stats.topVoted.map((f) => (
              <li key={f.id} className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
                <Link
                  href={`${ROUTES.admin.features}/${f.id}`}
                  className="hover:text-primary truncate text-sm font-medium"
                >
                  {f.title}
                </Link>
                <div className="ml-2 flex shrink-0 items-center gap-2">
                  <StatusBadge status={f.status} />
                  <span className="text-muted-foreground text-xs tabular-nums">{f.vote_count} votes</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Recent Features</h2>
        <ul className="space-y-2">
          {stats.recentFeatures.map((f) => (
            <li key={f.id} className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
              <Link
                href={`${ROUTES.admin.features}/${f.id}`}
                className="hover:text-primary truncate text-sm font-medium"
              >
                {f.title}
              </Link>
              <div className="ml-2 flex shrink-0 items-center gap-2">
                <StatusBadge status={f.status} />
                {f.target_release && (
                  <span className="text-muted-foreground hidden text-xs sm:inline">
                    {formatDate(f.target_release)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
