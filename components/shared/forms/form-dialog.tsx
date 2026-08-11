'use client'

import { type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  /**
   * Interactive field count. ≤3 stays a centered dialog; >3 opens a wide
   * side sheet so multi-field forms are not cramped in a modal.
   */
  fieldCount?: number
  /** Dialog-only width when fieldCount ≤ 3. */
  maxWidth?: 'sm' | 'md' | 'lg'
}

const dialogWidths = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-xl',
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  fieldCount = 1,
  maxWidth = 'md',
}: FormDialogProps) {
  const useSheet = fieldCount > 3

  if (useSheet) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl md:max-w-2xl"
        >
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="px-6 py-5">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-full ${dialogWidths[maxWidth]}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
