'use client'

import { History } from 'lucide-react'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { useGetActivity } from '@/services/activity/use-get-activity'
import { FeatureDetailPanel } from './feature-detail-panel'
import { FeatureDetailContent } from './feature-detail-content'
import { formatRelative } from '@/utils/format'

interface FeatureActivityProps {
  featureId: string
}

function formatAction(
  action: string,
  field: string | null,
  oldValue: string | null,
  newValue: string | null
) {
  switch (action) {
    case 'created':
      return 'created this feature'
    case 'status_changed':
      return `changed status ${oldValue ?? '?'} → ${newValue ?? '?'}`
    case 'priority_changed':
      return `changed priority ${oldValue ?? '?'} → ${newValue ?? '?'}`
    case 'assignee_changed':
      return newValue ? 'changed the owner' : 'cleared the owner'
    case 'commented':
      return 'added a comment'
    case 'subtask_added':
      return `added subtask “${newValue}”`
    case 'subtask_completed':
      return `completed subtask “${newValue}”`
    case 'subtask_reopened':
      return `reopened subtask “${newValue}”`
    case 'subtask_status_changed':
      return `moved subtask to ${newValue}`
    case 'subtask_deleted':
      return `deleted subtask “${oldValue}”`
    case 'attachment_added':
      return `added ${field === 'link' ? 'link' : 'file'} “${newValue}”`
    case 'attachment_removed':
      return `removed “${oldValue}”`
    case 'docs_updated':
      return 'updated the docs'
    default:
      return action.replaceAll('_', ' ')
  }
}

export function FeatureActivity({ featureId }: FeatureActivityProps) {
  const { data: items = [], isLoading } = useGetActivity(featureId)

  if (isLoading) return <PageLoader />

  return (
    <FeatureDetailPanel
      header={<h3 className="text-sm font-semibold">Activity</h3>}
    >
      {items.length === 0 ? (
        <FeatureDetailContent size="md">
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Updates to this feature will show up here."
          />
        </FeatureDetailContent>
      ) : (
        <FeatureDetailContent size="md">
          <ul className="space-y-3">
            {items.map((item) => {
              const name = item.actor_full_name ?? 'Someone'
              return (
                <li
                  key={item.id}
                  className="bg-muted/30 flex gap-3 rounded-lg border px-3 py-2.5"
                >
                  <UserAvatar name={name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{name}</span>{' '}
                      <span className="text-muted-foreground">
                        {formatAction(item.action, item.field, item.old_value, item.new_value)}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatRelative(item.created_at)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </FeatureDetailContent>
      )}
    </FeatureDetailPanel>
  )
}
