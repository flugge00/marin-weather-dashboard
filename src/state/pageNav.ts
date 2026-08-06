import { useCallback, useEffect, useMemo, useState } from 'react'

export interface PageNav {
  pageCount: number
  currentPage: number
  goToPage: (index: number) => void
  next: () => void
  prev: () => void
  canGoNext: boolean
  canGoPrev: boolean
}

/**
 * Tracks which dashboard page is currently displayed. Clamped rather than
 * wrapping - swiping past the last page just stops, matching iOS springboard
 * behavior instead of looping.
 */
export function usePageNav(pageCount: number, initialPage = 0): PageNav {
  const clamp = useCallback(
    (index: number) => Math.min(Math.max(index, 0), Math.max(pageCount - 1, 0)),
    [pageCount],
  )

  const [currentPage, setCurrentPage] = useState(() => clamp(initialPage))

  // Re-clamp if pageCount shrinks out from under the current page (task
  // 6.12: removing a page while it's the one on screen, or removing a page
  // after it and pushing it out of range) - adjusted during render rather
  // than an effect, same pattern as DashboardManagerModal's prop-driven
  // state reset.
  const [clampedForPageCount, setClampedForPageCount] = useState(pageCount)
  if (pageCount !== clampedForPageCount) {
    setClampedForPageCount(pageCount)
    const reclamped = clamp(currentPage)
    if (reclamped !== currentPage) setCurrentPage(reclamped)
  }

  const goToPage = useCallback(
    (index: number) => setCurrentPage(clamp(index)),
    [clamp],
  )

  const next = useCallback(
    () => setCurrentPage((prev) => clamp(prev + 1)),
    [clamp],
  )

  const prev = useCallback(
    () => setCurrentPage((prev) => clamp(prev - 1)),
    [clamp],
  )

  return useMemo(
    () => ({
      pageCount,
      currentPage,
      goToPage,
      next,
      prev,
      canGoNext: currentPage < pageCount - 1,
      canGoPrev: currentPage > 0,
    }),
    [pageCount, currentPage, goToPage, next, prev],
  )
}

/** Arrow-key paging for an attached keyboard (iPad + Magic Keyboard/Smart Keyboard). */
export function useKeyboardPageNav(nav: PageNav) {
  const { next, prev } = nav
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') next()
      else if (event.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, prev])
}
