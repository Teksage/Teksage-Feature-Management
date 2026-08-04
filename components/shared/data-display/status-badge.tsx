import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { FeaturePriority, FeatureStatus } from '@/types/supabase.types'

type StatusValue = FeatureStatus | FeaturePriority

const STATUS_CONFIG: Record<StatusValue, { label: string; className: string }> = {
  Idea: {
    label: 'Idea',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  },
  Planned: {
    label: 'Planned',
    className: 'bg-info/10 text-info border-info/20 hover:bg-info/20',
  },
  'In Progress': {
    label: 'In Progress',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  Low: {
    label: 'Low',
    className: 'bg-muted text-muted-foreground border-border',
  },
  Medium: {
    label: 'Medium',
    className: 'bg-info/10 text-info border-info/20',
  },
  High: {
    label: 'High',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  Critical: {
    label: 'Critical',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}

interface StatusBadgeProps {
  status: StatusValue
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  if (!config) return <Badge variant="outline">{status}</Badge>

  return (
    <Badge variant="outline" className={cn(config.className, 'font-medium', className)}>
      {config.label}
    </Badge>
  )
}
