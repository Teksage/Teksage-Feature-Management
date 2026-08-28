'use client'

import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { FeatureForm } from './feature-form'
import type { FeatureInput } from '@/lib/validations/feature'
import type { FeaturePlatform, FeatureStatus } from '@/types/supabase.types'
import type { IFeatureEntity } from '@/services/features/features.types'

interface FeatureBoardDialogsProps {
  isMarketing: boolean
  isAdmin: boolean
  createOpen: boolean
  createStatus: FeatureStatus
  createPlatform: FeaturePlatform
  editFeature: IFeatureEntity | null
  deleteId: string | null
  isSubmitting: boolean
  isDeleting: boolean
  onCreateOpenChange: (open: boolean) => void
  onEditClose: () => void
  onDeleteClose: () => void
  onSubmitCreate: (data: FeatureInput) => Promise<void>
  onSubmitEdit: (data: FeatureInput, id: string) => Promise<void>
  onConfirmDelete: () => void
}

export function FeatureBoardDialogs({
  isMarketing,
  isAdmin,
  createOpen,
  createStatus,
  createPlatform,
  editFeature,
  deleteId,
  isSubmitting,
  isDeleting,
  onCreateOpenChange,
  onEditClose,
  onDeleteClose,
  onSubmitCreate,
  onSubmitEdit,
  onConfirmDelete,
}: FeatureBoardDialogsProps) {
  return (
    <>
      <FormDialog
        open={createOpen}
        onOpenChange={(o) => {
          if (!o) onCreateOpenChange(false)
        }}
        title={isMarketing ? 'New plan' : 'New Feature'}
        fieldCount={isMarketing ? 7 : 8}
      >
        <FeatureForm
          hidePlatform={isMarketing}
          defaultValues={{ status: createStatus, platform: createPlatform }}
          canManageStatus={isAdmin}
          isSubmitting={isSubmitting}
          submitLabel={isMarketing ? 'Create plan' : undefined}
          onSubmit={onSubmitCreate}
        />
      </FormDialog>

      {isAdmin && (
        <FormDialog
          open={!!editFeature}
          onOpenChange={(o) => {
            if (!o) onEditClose()
          }}
          title={isMarketing ? 'Edit plan' : 'Edit Feature'}
          fieldCount={isMarketing ? 7 : 8}
        >
          {editFeature && (
            <FeatureForm
              hidePlatform={isMarketing}
              defaultValues={editFeature}
              canManageStatus
              isSubmitting={isSubmitting}
              submitLabel={isMarketing ? 'Update plan' : undefined}
              onSubmit={(d) => onSubmitEdit(d, editFeature.id)}
            />
          )}
        </FormDialog>
      )}

      {isAdmin && (
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(o) => {
            if (!o) onDeleteClose()
          }}
          title={isMarketing ? 'Delete plan' : 'Delete Feature'}
          description={
            isMarketing
              ? 'This will permanently delete the marketing plan.'
              : 'This will permanently delete the feature along with its votes and comments.'
          }
          confirmLabel="Delete"
          variant="destructive"
          loading={isDeleting}
          onConfirm={onConfirmDelete}
        />
      )}
    </>
  )
}
