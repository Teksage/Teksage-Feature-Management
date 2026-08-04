'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PAGE_SIZE_OPTIONS } from '@/lib/constants'

interface PaginationControlsProps {
  page: number
  totalPages: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  totalItems?: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
}

export function PaginationControls({
  page,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  totalItems = 0,
  pageSize,
  onPageSizeChange,
}: PaginationControlsProps) {
  if (totalItems <= 0) return null

  const start = pageSize ? (page - 1) * pageSize + 1 : 1
  const end = pageSize ? Math.min(page * pageSize, totalItems) : totalItems

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <p className="text-muted-foreground text-sm">
        Showing {start}–{end} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {pageSize != null && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Rows</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-8 w-[4.5rem]">
                <SelectValue>{(value: string | null) => value ?? String(pageSize)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon" onClick={onPrev} disabled={!canPrev}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="text-muted-foreground min-w-16 text-center text-sm">
            {page} / {totalPages}
          </span>
          <Button type="button" variant="outline" size="icon" onClick={onNext} disabled={!canNext}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
