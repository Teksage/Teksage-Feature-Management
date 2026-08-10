'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { FEATURE_PRIORITIES, FEATURE_STATUSES } from '@/lib/constants'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface DashboardChartsProps {
  byStatus: Record<string, number>
  byPriority: Record<string, number>
}

export function DashboardCharts({ byStatus, byPriority }: DashboardChartsProps) {
  const statusData = FEATURE_STATUSES.map((status) => ({
    name: status,
    count: byStatus[status] ?? 0,
  }))

  const priorityData = FEATURE_PRIORITIES.map((priority, i) => ({
    name: priority,
    value: byPriority[priority] ?? 0,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((d) => d.value > 0)

  const hasPriority = priorityData.length > 0
  const totalPriority = priorityData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FeatureCardSection title="Pipeline by status">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {statusData.map((_, i) => (
                  <Cell key={FEATURE_STATUSES[i]} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FeatureCardSection>

      <FeatureCardSection title="Priority mix">
        <div className="flex h-56 items-center gap-4">
          {hasPriority ? (
            <>
              <div className="h-full min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {priorityData.map((d) => (
                        <Cell key={d.name} fill={d.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-28 shrink-0 space-y-2">
                {priorityData.map((d) => (
                  <li key={d.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: d.fill }}
                    />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                    <span className="text-foreground ml-auto tabular-nums font-medium">
                      {Math.round((d.value / totalPriority) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground w-full text-center text-sm">No features yet.</p>
          )}
        </div>
      </FeatureCardSection>
    </div>
  )
}
