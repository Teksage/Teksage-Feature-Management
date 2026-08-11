'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageLoader } from '@/components/shared/feedback/page-loader'

interface AttachmentUploadDialogProps {
  open: boolean
  fileName: string
}

export function AttachmentUploadDialog({ open, fileName }: AttachmentUploadDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Uploading file</DialogTitle>
          <DialogDescription>
            Please wait while your file is uploaded. Do not close this page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-4">
          <PageLoader size="small" className="min-h-0 py-0" />
          <p className="text-muted-foreground max-w-full truncate text-center text-sm">
            {fileName}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
