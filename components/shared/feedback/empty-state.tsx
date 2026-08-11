import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-14 text-center',
        'from-muted/40 to-muted/10 bg-gradient-to-b',
        className
      )}
    >
      <div
        className="from-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-brand-secondary/5"
        aria-hidden
      />
      {Icon && (
        <div className="bg-primary/10 ring-primary/20 relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ring-1">
          <Icon className="text-primary h-8 w-8" />
        </div>
      )}
      <h3 className="relative text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="text-muted-foreground relative mt-2 max-w-sm text-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="relative mt-5">
          {action.label}
        </Button>
      )}
    </div>
  )
}
