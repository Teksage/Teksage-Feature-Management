'use client'

import { PageLoader } from '@/components/shared/feedback/page-loader'
import { cn } from '@/utils/cn'

interface LoadingSkeletonProps {
  className?: string
}

/** Site-wide loading state — uses brand Riple indicator. */
export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <PageLoader className={cn(className)} />
}
