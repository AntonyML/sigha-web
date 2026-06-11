import { useState, useEffect } from 'react'

export interface UsePaginationResult<T> {
  paginatedItems: T[]
  page: number
  totalPages: number
  total: number
  pageSize: number
  goToPage: (n: number) => void
  nextPage: () => void
  prevPage: () => void
}

/**
 * Client-side pagination hook.
 * Resets to page 1 whenever the item count changes (e.g. after a search filter).
 *
 * @param items    Full filtered array
 * @param pageSize Number of items per page (default 20)
 */
export function usePagination<T>(
  items: T[],
  pageSize = 20,
): UsePaginationResult<T> {
  const [page, setPage] = useState(1)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const paginatedItems = items.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  // Reset to page 1 when filter results change
  useEffect(() => {
    setPage(1)
  }, [total])

  const goToPage = (n: number) =>
    setPage(Math.max(1, Math.min(n, totalPages)))

  return {
    paginatedItems,
    page: safePage,
    totalPages,
    total,
    pageSize,
    goToPage,
    nextPage: () => goToPage(safePage + 1),
    prevPage: () => goToPage(safePage - 1),
  }
}
