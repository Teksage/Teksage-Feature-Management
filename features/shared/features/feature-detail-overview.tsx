'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { ReleaseCountdown } from '@/components/shared/data-display/release-countdown'
import { FeatureVoteButton } from './feature-vote-button'
import { FeatureAssigneeField } from './feature-assignee-field'
import { FeatureComments } from './feature-comments'
import { FeatureDetailPanel } from './feature-detail-panel'
import { FeatureDetailContent } from './feature-detail-content'
import { FEATURE_STATUSES, FEATURE_PRIORITIES } from '@/lib/constants'
import type { IFeatureEntity } from '@/services/features/features.types'
import type { ITeamMember } from '@/services/team/use-get-team'
import type { FeatureStatus, FeaturePriority } from '@/types/supabase.types'

interface FeatureDetailOverviewProps {
  feature: IFeatureEntity
  members: ITeamMember[]
  canChangeStatus: boolean
  canEditMeta: boolean
  onStatusChange: (value: FeatureStatus | null) => void
  onPriorityChange: (value: FeaturePriority | null) => void
  onAssigneeChange: (assigneeId: string) => void
  onEdit: () => void
  onDelete: () => void
  hidePlatform?: boolean
}

export function FeatureDetailOverview({
  feature,
  members,
  canChangeStatus,
  canEditMeta,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onEdit,
  onDelete,
  hidePlatform = false,
}: FeatureDetailOverviewProps) {
  return (
    <FeatureDetailPanel>
      <div className="space-y-6">
        <FeatureDetailContent size="lg" className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{feature.title}</h1>
          <FeatureVoteButton
            featureId={feature.id}
            voteCount={feature.vote_count}
            hasVoted={feature.has_voted}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canChangeStatus ? (
            <Select value={feature.status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEATURE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <StatusBadge status={feature.status} />
          )}

          {canEditMeta ? (
            <Select value={feature.priority} onValueChange={onPriorityChange}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEATURE_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <StatusBadge status={feature.priority} />
          )}

          {feature.category_name && (
            <span className="text-muted-foreground text-xs">in {feature.category_name}</span>
          )}
          {hidePlatform ? null : (
          <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-[11px]">
            {feature.platform}
          </span>
          )}
          <ReleaseCountdown date={feature.target_release} showDate />
        </div>

        {canEditMeta ? (
          <div className="w-full max-w-md">
            <FeatureAssigneeField
              members={members}
              assigneeId={feature.assignee_id ?? ''}
              onChange={onAssigneeChange}
              triggerClassName="h-9 w-full text-sm"
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Assignee:{' '}
            <span className="text-foreground font-medium">
              {feature.assignee_full_name ?? 'Unassigned'}
            </span>
          </p>
        )}

        {feature.description && (
          <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
            {feature.description}
          </p>
        )}

        {canEditMeta && (
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}
        </FeatureDetailContent>

        <FeatureComments featureId={feature.id} />
      </div>
    </FeatureDetailPanel>
  )
}
