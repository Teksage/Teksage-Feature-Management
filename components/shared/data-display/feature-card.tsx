'use client'

import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/utils/cn'

type Accent = 'brand' | 'muted' | 'danger' | 'success' | 'warning'

const ACCENT_STYLES: Record<Accent, string> = {
  brand: 'bg-primary',
  muted: 'bg-muted-foreground/25',
  danger: 'bg-destructive',
  success: 'bg-success',
  warning: 'bg-warning',
}

interface FeatureCardProps {
  children: React.ReactNode
  footer?: React.ReactNode
  accent?: Accent
  highlighted?: boolean
  className?: string
  contentClassName?: string
  onClick?: () => void
}

export function FeatureCard({
  children,
  footer,
  accent = 'brand',
  highlighted = false,
  className,
  contentClassName,
  onClick,
}: FeatureCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'group shadow-card gap-0 py-0 transition-all duration-200',
        'hover:shadow-dropdown hover:ring-primary/20 hover:-translate-y-0.5',
        highlighted && 'ring-primary/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className={cn('h-1.5 w-full', ACCENT_STYLES[accent])} />
      <CardContent className={cn('space-y-4 pt-4 pb-4', contentClassName)}>{children}</CardContent>
      {footer ? (
        <CardFooter className="bg-muted/40 gap-2 border-t py-3">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}

interface FeatureCardMetaProps {
  icon: LucideIcon
  label: string
  className?: string
  tone?: 'default' | 'danger' | 'warning' | 'success'
}

const META_TONES = {
  default: 'bg-primary/10 text-primary',
  danger: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
} as const

export function FeatureCardMeta({
  icon: Icon,
  label,
  className,
  tone = 'default',
}: FeatureCardMetaProps) {
  return (
    <div
      className={cn(
        'border-border/70 bg-background/80 text-muted-foreground flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs',
        className
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
          META_TONES[tone]
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-foreground/80 truncate font-medium">{label}</span>
    </div>
  )
}

interface FeatureCardDateBlockProps {
  day: string
  month: string
  weekday?: string
  tone?: 'brand' | 'secondary' | 'muted' | 'danger' | 'warning'
}

const DATE_TONES = {
  brand: 'border-primary/20 bg-primary/10 text-primary',
  secondary: 'border-brand-secondary/20 bg-brand-secondary/10 text-brand-secondary',
  muted: 'border-border bg-muted/60 text-muted-foreground',
  danger: 'border-destructive/20 bg-destructive/10 text-destructive',
  warning: 'border-warning/20 bg-warning/10 text-warning',
} as const

export function FeatureCardDateBlock({
  day,
  month,
  weekday,
  tone = 'secondary',
}: FeatureCardDateBlockProps) {
  return (
    <div
      className={cn(
        'flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border py-2',
        DATE_TONES[tone]
      )}
    >
      <span className="text-[10px] font-semibold tracking-wide uppercase">{month}</span>
      <span className="text-xl leading-none font-bold tabular-nums">{day}</span>
      {weekday ? <span className="text-muted-foreground mt-0.5 text-[10px]">{weekday}</span> : null}
    </div>
  )
}

interface FeatureCardSectionProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

/** Section/panel card (charts, forms, quick actions) using the same shell. */
export function FeatureCardSection({
  title,
  children,
  action,
  className,
}: FeatureCardSectionProps) {
  return (
    <FeatureCard className={className} contentClassName="space-y-3" footer={undefined}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </FeatureCard>
  )
}
