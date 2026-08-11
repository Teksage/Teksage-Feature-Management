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
  /** Tighter padding for dense pages (e.g. boards). */
  dense?: boolean
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  children,
  footer,
  dense = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'glass-panel relative overflow-hidden rounded-2xl border',
        dense ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6',
        className
      )}
    >
      <div
        className="from-primary/15 via-brand-secondary/10 pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent"
        aria-hidden
      />
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-start sm:justify-between',
          dense ? 'gap-2.5' : 'gap-4'
        )}
      >
        <div className={cn('flex min-w-0 items-start', dense ? 'gap-3' : 'gap-4')}>
          {Icon && (
            <span
              className={cn(
                'bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-xl',
                dense ? 'h-9 w-9' : 'h-11 w-11'
              )}
            >
              <Icon className={dense ? 'h-4 w-4' : 'h-5 w-5'} />
            </span>
          )}
          <div className="min-w-0">
            <h1
              className={cn(
                'font-bold tracking-tight',
                dense ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  'text-muted-foreground max-w-2xl leading-relaxed',
                  dense ? 'mt-0.5 text-xs sm:text-sm' : 'mt-1 text-sm'
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">{children}</div>
        )}
      </div>
      {footer && (
        <div
          className={cn(
            'border-border/60 border-t',
            dense ? 'mt-3 pt-3' : 'mt-5 pt-5'
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
