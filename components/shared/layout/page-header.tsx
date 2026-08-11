import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** Top-right actions (view toggle, buttons). */
  children?: ReactNode
  /** Full-width row below title — filters, toolbars, etc. */
  footer?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'glass-panel relative overflow-hidden rounded-2xl border p-5 sm:p-6',
        className
      )}
    >
      <div
        className="from-primary/15 via-brand-secondary/10 pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent"
        aria-hidden
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <span className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">{children}</div>
        )}
      </div>
      {footer && (
        <div className="border-border/60 mt-5 border-t pt-5">{footer}</div>
      )}
    </div>
  )
}
