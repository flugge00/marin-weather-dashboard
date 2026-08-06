import { useRef, type ReactNode, type TouchEvent } from 'react'
import { useLocale } from '../state/locale/context'

interface PageDeckProps {
  currentPage: number
  pageCount: number
  onNext: () => void
  onPrev: () => void
  children: ReactNode[]
}

const SWIPE_THRESHOLD_PX = 60
const EDGE_TAP_ZONE_PX = 40

/**
 * Horizontal page carousel: swipe left/right, or tap the invisible edge
 * zones. Pages are laid out side by side and translated as a whole rather
 * than mounting/unmounting, so widget state (poll timers, etc.) survives
 * paging.
 */
export function PageDeck({
  currentPage,
  pageCount,
  onNext,
  onPrev,
  children,
}: PageDeckProps) {
  const { t } = useLocale()
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX
    touchDeltaX.current = 0
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    touchDeltaX.current = event.touches[0].clientX - touchStartX.current
  }

  const handleTouchEnd = () => {
    if (touchDeltaX.current <= -SWIPE_THRESHOLD_PX) onNext()
    else if (touchDeltaX.current >= SWIPE_THRESHOLD_PX) onPrev()
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{
          width: `${pageCount * 100}%`,
          transform: `translateX(-${(currentPage * 100) / pageCount}%)`,
        }}
      >
        {children.map((page, index) => (
          <div
            key={index}
            className="h-full shrink-0"
            style={{ width: `${100 / pageCount}%` }}
          >
            {page}
          </div>
        ))}
      </div>

      {currentPage > 0 && (
        <button
          type="button"
          aria-label={t('pageDeck.previousPage')}
          onClick={onPrev}
          className="absolute top-0 left-0 h-full opacity-0"
          style={{ width: EDGE_TAP_ZONE_PX }}
        />
      )}
      {currentPage < pageCount - 1 && (
        <button
          type="button"
          aria-label={t('pageDeck.nextPage')}
          onClick={onNext}
          className="absolute top-0 right-0 h-full opacity-0"
          style={{ width: EDGE_TAP_ZONE_PX }}
        />
      )}
    </div>
  )
}
