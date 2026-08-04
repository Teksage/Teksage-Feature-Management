'use client'

import { Riple } from 'react-loading-indicators'
import { cn } from '@/utils/cn'

interface PageLoaderProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

export function PageLoader({ className, size = 'medium', fullScreen = false }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center',
        fullScreen ? 'min-h-dvh' : 'min-h-32 py-10',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <Riple color="var(--color-primary)" size={size} text={false} />
    </div>
  )
}
