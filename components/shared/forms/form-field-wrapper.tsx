'use client'

import { type ReactNode } from 'react'
import { type FieldError } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

interface FormFieldWrapperProps {
  label: string
  htmlFor?: string
  error?: FieldError
  required?: boolean
  hint?: string
  className?: string
  children: ReactNode
}

export function FormFieldWrapper({
  label,
  htmlFor,
  error,
  required,
  hint,
  className,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-muted-foreground text-xs">{hint}</p>}
      {error && <p className="text-destructive text-xs">{error.message}</p>}
    </div>
  )
}
