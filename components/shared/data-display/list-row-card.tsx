import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ListRowCardProps {
  children: ReactNode
  className?: string
  as?: 'li' | 'div'
}

/** Interactive list row with hover elevation — dashboards, team, releases. */
export function ListRowCard({ children, className, as: Tag = 'li' }: ListRowCardProps) {
  return (
    <Tag
      className={cn(
        'bg-card group flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5',
        'shadow-card transition-all duration-200',
        'hover:border-primary/25 hover:shadow-dropdown',
        className
      )}
    >
      {children}
    </Tag>
  )
}
