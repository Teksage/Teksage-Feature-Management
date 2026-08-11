import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FeatureDetailPanelProps {
  children: ReactNode
  className?: string
  /** Optional header row (title + actions). */
  header?: ReactNode
}

/** Full-width panel shell shared by every feature detail tab. */
export function FeatureDetailPanel({ children, className, header }: FeatureDetailPanelProps) {
  return (
    <section
      className={cn(
        'bg-card flex min-h-[min(70vh,720px)] w-full flex-col gap-4 rounded-xl border p-4 sm:p-6',
        className
      )}
    >
      {header}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}
