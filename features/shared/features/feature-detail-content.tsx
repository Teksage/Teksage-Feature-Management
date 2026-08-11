import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ContentSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClasses: Record<ContentSize, string> = {
  /** Single-line add rows (subtask, quick inputs). */
  xs: 'w-full max-w-full sm:max-w-xs',
  /** Short forms (comment box, add link). */
  sm: 'w-full max-w-full sm:max-w-md',
  /** Lists, timelines, attachment rows. */
  md: 'w-full max-w-full lg:max-w-2xl',
  /** Docs editor / longer prose. */
  lg: 'w-full max-w-full lg:max-w-3xl',
}

interface FeatureDetailContentProps {
  children: ReactNode
  size?: ContentSize
  className?: string
}

/** Keeps tab content readable on full-width panels. */
export function FeatureDetailContent({
  children,
  size = 'md',
  className,
}: FeatureDetailContentProps) {
  const pinStart = size === 'xs' || size === 'sm'

  return (
    <div className={cn(sizeClasses[size], pinStart && 'self-start', className)}>{children}</div>
  )
}
