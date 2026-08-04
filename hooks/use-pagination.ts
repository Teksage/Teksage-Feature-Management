import { useCallback, useMemo, useState } from 'react'
import { PAGE_SIZE } from '@/lib/constants'

export function usePagination(initialPageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const offset = (page - 1) * pageSize

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPage(1)
  }, [])

  const reset = useCallback(() => {
    setPage(1)
  }, [])

  const getState = useCallback(
    (total: number) => {
      const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
      const safePage = Math.min(page, totalPages)
      return {
        totalPages,
        canPrev: safePage > 1,
        canNext: safePage < totalPages,
        page: safePage,
      }
    },
    [page, pageSize]
  )

  const goTo = useCallback(
    (p: number, total = Number.MAX_SAFE_INTEGER) => {
      const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
      setPage(Math.min(Math.max(1, p), totalPages))
    },
    [pageSize]
  )

  /** Slice an in-memory list for client-side pagination. */
  const paginate = useCallback(
    <T>(items: T[]) => {
      const totalPages = Math.max(1, Math.ceil(items.length / pageSize) || 1)
      const safePage = Math.min(page, totalPages)
      const start = (safePage - 1) * pageSize
      return items.slice(start, start + pageSize)
    },
    [page, pageSize]
  )

  return useMemo(
    () => ({
      page,
      pageSize,
      offset,
      setPageSize,
      reset,
      goTo,
      getState,
      paginate,
    }),
    [page, pageSize, offset, setPageSize, reset, goTo, getState, paginate]
  )
}
