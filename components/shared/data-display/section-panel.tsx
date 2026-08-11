import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { cn } from '@/utils/cn'

interface SectionPanelProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Dashboard section with icon header and elevated card shell. */
export function SectionPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: SectionPanelProps) {
  return (
    <FeatureCard className={className} contentClassName="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </FeatureCard>
  )
}

interface SectionHeadingProps {
  title: string
  className?: string
}

export function SectionHeading({ title, className }: SectionHeadingProps) {
  return (
    <h2 className={cn('text-muted-foreground text-xs font-semibold tracking-wider uppercase', className)}>
      {title}
    </h2>
  )
}
