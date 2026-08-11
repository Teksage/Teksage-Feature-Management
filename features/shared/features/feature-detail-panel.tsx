import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FeatureDetailPanelProps {
  children: ReactNode
  className?: string
  header?: ReactNode
}

/** Full-width panel shell shared by every feature detail tab. */
export function FeatureDetailPanel({ children, className, header }: FeatureDetailPanelProps) {
  return (
    <section
      className={cn(
        'bg-card flex min-h-[min(70vh,720px)] w-full flex-col gap-4 rounded-2xl border p-4 shadow-card sm:p-6',
        'ring-border/50 ring-1',
        className
      )}
    >
      {header && (
        <div className="border-border/60 border-b pb-3">{header}</div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}
