'use client'

import { LayoutDashboard, Lightbulb, CheckCircle2, BarChart3, AlertTriangle, Star } from 'lucide-react'
import { PageHeader } from '@/components/shared/layout/page-header'
import { StatsCard } from '@/components/shared/data-display/stats-card'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { SectionPanel } from '@/components/shared/data-display/section-panel'
import { UpcomingReleases, FeatureLinkList } from '@/components/shared/data-display/upcoming-releases'
import { DashboardCharts } from '@/features/shared/dashboard/dashboard-charts'
import { useDashboardStats } from '@/services/dashboard/use-dashboard-stats'
import { ROUTES } from '@/lib/constants'

export function MemberDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) return <PageLoader />
  if (!stats) return null

  return (
    <div className="space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Your product ideas at a glance — vote, comment, and track what ships next."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Features" value={stats.totalFeatures} icon={Lightbulb} variant="primary" />
        <StatsCard title="In Progress" value={stats.byStatus['In Progress'] ?? 0} icon={BarChart3} variant="warning" />
        <StatsCard title="Completed" value={stats.byStatus['Completed'] ?? 0} icon={CheckCircle2} variant="success" />
        <StatsCard title="Overdue" value={stats.overdueCount} icon={AlertTriangle} variant="destructive" />
      </div>

      <DashboardCharts byStatus={stats.byStatus} byPriority={stats.byPriority} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingReleases features={stats.allFeatures} basePath={ROUTES.member.features} />

        <SectionPanel title="Top Voted Features" icon={Star}>
          <FeatureLinkList
            features={stats.topVoted}
            basePath={ROUTES.member.features}
            showVotes
          />
        </SectionPanel>
      </div>
    </div>
  )
}
