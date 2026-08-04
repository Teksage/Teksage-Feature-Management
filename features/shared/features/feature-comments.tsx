'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, MessageSquare } from 'lucide-react'
import { formatRelative } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { commentSchema, type CommentInput } from '@/lib/validations/feature'
import { useGetComments } from '@/services/comments/use-get-comments'
import { useAddComment } from '@/services/comments/use-add-comment'
import { useDeleteComment } from '@/services/comments/use-delete-comment'
import { useAuthStore } from '@/store/auth-store'

interface FeatureCommentsProps {
  featureId: string
}

export function FeatureComments({ featureId }: FeatureCommentsProps) {
  const { user } = useAuthStore()
  const { data: comments = [], isLoading } = useGetComments(featureId)
  const addComment = useAddComment()
  const deleteComment = useDeleteComment(featureId)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentInput>({ resolver: zodResolver(commentSchema) })

  async function onSubmit(data: CommentInput) {
    await addComment.mutateAsync({ featureId, body: data.body })
    reset()
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        Comments <span className="text-muted-foreground font-normal">({comments.length})</span>
      </h3>

      {comments.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No comments yet" description="Be the first to comment." />
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="bg-muted/30 rounded-lg border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium">{c.author_name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{formatRelative(c.created_at)}</span>
                </div>
                {(user?.id === c.user_id || user?.role === 'Admin') && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setDeleteId(c.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <FormFieldWrapper label="Add a comment" error={errors.body}>
          <Textarea rows={2} placeholder="Write a comment…" {...register('body')} />
        </FormFieldWrapper>
        <Button type="submit" size="sm" disabled={isSubmitting || addComment.isPending}>
          Post Comment
        </Button>
      </form>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Comment"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteComment.isPending}
        onConfirm={() => {
          if (deleteId) deleteComment.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
        }}
      />
    </div>
  )
}
