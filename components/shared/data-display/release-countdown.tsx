import { cn } from '@/utils/cn'
import { formatDate, formatReleaseCountdown, getReleaseUrgency } from '@/utils/format'

interface ReleaseCountdownProps {
  date: string | null | undefined
  className?: string
  showDate?: boolean
}

export function ReleaseCountdown({ date, className, showDate = false }: ReleaseCountdownProps) {
  if (!date) return null

  const urgency = getReleaseUrgency(date)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
        urgency === 'overdue' && 'border-destructive/30 bg-destructive/10 text-destructive',
        urgency === 'due-soon' && 'border-warning/40 bg-warning/15 text-warning-foreground',
        urgency === 'upcoming' && 'border-border bg-muted text-muted-foreground',
        className
      )}
    >
      {formatReleaseCountdown(date)}
      {showDate && <span className="opacity-70">· {formatDate(date)}</span>}
    </span>
  )
}
