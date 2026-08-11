'use client'

import { useState } from 'react'
import { CheckSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { useGetSubtasks } from '@/services/subtasks/use-get-subtasks'
import { useAddSubtask } from '@/services/subtasks/use-add-subtask'
import { useUpdateSubtaskStatus } from '@/services/subtasks/use-update-subtask-status'
import { useDeleteSubtask } from '@/services/subtasks/use-delete-subtask'
import { FeatureDetailPanel } from './feature-detail-panel'
import { FeatureDetailContent } from './feature-detail-content'
import { SubtaskRow } from './subtask-row'
import { subtaskStatusStyle } from './subtask-status-styles'
import { SUBTASK_STATUSES } from '@/lib/constants'
import type { SubtaskStatus } from '@/types/supabase.types'
import { cn } from '@/utils/cn'

interface FeatureSubtasksProps {
  featureId: string
  canManage: boolean
}

export function FeatureSubtasks({ featureId, canManage }: FeatureSubtasksProps) {
  const { data: subtasks = [], isLoading } = useGetSubtasks(featureId)
  const addSubtask = useAddSubtask(featureId)
  const updateStatus = useUpdateSubtaskStatus(featureId)
  const deleteSubtask = useDeleteSubtask(featureId)
  const [title, setTitle] = useState('')

  const done = subtasks.filter((s) => s.status === 'Completed').length
  const progress = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0

  const counts = SUBTASK_STATUSES.reduce(
    (acc, status) => {
      acc[status] = subtasks.filter((s) => s.status === status).length
      return acc
    },
    {} as Record<SubtaskStatus, number>
  )

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await addSubtask.mutateAsync({ title: trimmed })
    setTitle('')
  }

  function handleStatusChange(
    id: string,
    subtaskTitle: string,
    status: SubtaskStatus,
    previousStatus: SubtaskStatus
  ) {
    updateStatus.mutate({ id, title: subtaskTitle, status, previousStatus })
  }

  if (isLoading) return <PageLoader />

  return (
    <FeatureDetailPanel
      header={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              Subtasks{' '}
              <span className="text-muted-foreground font-normal">
                ({done}/{subtasks.length})
              </span>
            </h3>
            {subtasks.length > 0 && (
              <span className="text-muted-foreground text-xs font-medium tabular-nums">
                {progress}% complete
              </span>
            )}
          </div>

          {subtasks.length > 0 && (
            <>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="from-primary to-success h-full rounded-full bg-gradient-to-r transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {SUBTASK_STATUSES.map((status) => (
                  <span
                    key={status}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                      subtaskStatusStyle(status).trigger
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', subtaskStatusStyle(status).dot)} />
                    {counts[status]} {status}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {subtasks.length === 0 ? (
          <FeatureDetailContent size="md">
            <EmptyState
              icon={CheckSquare}
              title="No subtasks"
              description={
                canManage
                  ? 'Break this feature into smaller checklist items.'
                  : 'Only the assigned owner can add subtasks.'
              }
            />
          </FeatureDetailContent>
        ) : (
          <FeatureDetailContent size="md">
            <ul className="space-y-2.5">
              {subtasks.map((s) => (
                <SubtaskRow
                  key={s.id}
                  subtask={s}
                  canManage={canManage}
                  onStatusChange={handleStatusChange}
                  onDelete={(id, subtaskTitle) => deleteSubtask.mutate({ id, title: subtaskTitle })}
                />
              ))}
            </ul>
          </FeatureDetailContent>
        )}

        {canManage && (
          <FeatureDetailContent size="xs">
            <form
              onSubmit={handleAdd}
              className="bg-muted/30 mt-auto flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center"
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a subtask…"
                className="min-w-0 bg-background sm:flex-1"
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0 self-start sm:w-auto"
                disabled={addSubtask.isPending || !title.trim()}
              >
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </form>
          </FeatureDetailContent>
        )}
      </div>
    </FeatureDetailPanel>
  )
}
