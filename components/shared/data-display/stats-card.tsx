import { type LucideIcon } from 'lucide-react'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { cn } from '@/utils/cn'

type TrendDirection = 'up' | 'down' | 'neutral'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; direction: TrendDirection }
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
}

const accentByVariant = {
  default: 'brand',
  primary: 'brand',
  secondary: 'brand',
  success: 'success',
  warning: 'warning',
  destructive: 'danger',
} as const

const iconStyles: Record<string, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-brand-secondary/10 text-brand-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

const trendColors: Record<TrendDirection, string> = {
  up: 'text-success',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  return (
    <FeatureCard
      accent={accentByVariant[variant]}
      className={className}
      contentClassName="space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn('rounded-xl p-2.5', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(description || trend) && (
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className={cn('text-sm font-medium', trendColors[trend.direction])}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && <span className="text-muted-foreground text-xs">{description}</span>}
        </div>
      )}
    </FeatureCard>
  )
}
