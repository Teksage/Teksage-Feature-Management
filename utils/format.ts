import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isTomorrow,
  isPast,
  differenceInCalendarDays,
  startOfDay,
} from 'date-fns'

export function formatDate(dateStr: string, pattern = 'dd MMM yyyy') {
  try {
    return format(parseISO(dateStr), pattern)
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, h:mm a')
  } catch {
    return dateStr
  }
}

export function formatTime(timeStr: string) {
  try {
    const [h, m] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m, 0, 0)
    return format(date, 'h:mm a')
  } catch {
    return timeStr
  }
}

export function formatRelative(dateStr: string) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

/** Calendar-day delta from today to a YYYY-MM-DD (or ISO) date. Negative = overdue. */
export function daysUntil(dateStr: string): number | null {
  try {
    const target = startOfDay(parseISO(dateStr))
    if (Number.isNaN(target.getTime())) return null
    return differenceInCalendarDays(target, startOfDay(new Date()))
  } catch {
    return null
  }
}

export function formatReleaseCountdown(dateStr: string): string {
  const days = daysUntil(dateStr)
  if (days === null) return formatDate(dateStr)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days > 1) return `${days} days left`
  if (days === -1) return '1 day overdue'
  return `${Math.abs(days)} days overdue`
}

export type ReleaseUrgency = 'overdue' | 'due-soon' | 'upcoming' | 'none'

export function getReleaseUrgency(dateStr: string | null | undefined): ReleaseUrgency {
  if (!dateStr) return 'none'
  const days = daysUntil(dateStr)
  if (days === null) return 'none'
  if (days < 0) return 'overdue'
  if (days <= 7) return 'due-soon'
  return 'upcoming'
}

export function getMeetingLabel(dateStr: string): 'today' | 'tomorrow' | 'upcoming' | 'past' {
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'today'
    if (isTomorrow(date)) return 'tomorrow'
    if (isPast(date)) return 'past'
    return 'upcoming'
  } catch {
    return 'upcoming'
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
