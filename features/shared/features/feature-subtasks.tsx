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
import type { SubtaskStatus } from '@/types/supabase.types'

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
        <h3 className="text-sm font-semibold">
          Subtasks{' '}
          <span className="text-muted-foreground font-normal">
            ({done}/{subtasks.length})
          </span>
        </h3>
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
            <ul className="space-y-2">
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
              className="mt-auto flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center"
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a subtask…"
                className="min-w-0 sm:flex-1"
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
