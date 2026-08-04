'use client'

import { ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useToggleVote } from '@/services/votes/use-toggle-vote'

interface FeatureVoteButtonProps {
  featureId: string
  voteCount: number
  hasVoted: boolean
  disabled?: boolean
}

export function FeatureVoteButton({
  featureId,
  voteCount,
  hasVoted,
  disabled = false,
}: FeatureVoteButtonProps) {
  const { mutate, isPending } = useToggleVote()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || isPending}
      onClick={() => mutate({ featureId, hasVoted })}
      className={cn(
        'gap-1.5 transition-colors',
        hasVoted && 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
      )}
    >
      <ThumbsUp className={cn('h-3.5 w-3.5', hasVoted && 'fill-primary')} />
      <span className="tabular-nums">{voteCount}</span>
    </Button>
  )
}
