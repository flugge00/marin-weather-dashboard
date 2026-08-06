import { useLocale } from '../state/locale/context'

interface PageIndicatorProps {
  pageCount: number
  currentPage: number
  onSelect: (index: number) => void
  isEditMode: boolean
  onAddPage: () => void
  onRemoveCurrentPage: () => void
}

/** Page dots (Phase 2), plus edit-mode add/remove-page controls (task 6.12). */
export function PageIndicator({
  pageCount,
  currentPage,
  onSelect,
  isEditMode,
  onAddPage,
  onRemoveCurrentPage,
}: PageIndicatorProps) {
  const { t } = useLocale()
  if (pageCount <= 1 && !isEditMode) return null

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      {isEditMode && (
        <button
          type="button"
          aria-label={t('pageIndicator.removeCurrentPage')}
          onClick={onRemoveCurrentPage}
          disabled={pageCount <= 1}
          className="rounded-full bg-surface-raised px-2 py-1 text-xs font-medium text-surface-muted hover:text-surface-text disabled:opacity-30"
        >
          {t('pageIndicator.removePage')}
        </button>
      )}

      <div className="flex items-center gap-2">
        {Array.from({ length: pageCount }, (_, index) => {
          const isActive = index === currentPage
          return (
            <button
              key={index}
              type="button"
              aria-label={t('pageIndicator.goToPage', { n: index + 1 })}
              aria-current={isActive}
              onClick={() => onSelect(index)}
              className={`h-2 rounded-full transition-all ${
                isActive
                  ? 'w-6 bg-brand-400'
                  : 'w-2 bg-surface-border hover:bg-surface-muted'
              }`}
            />
          )
        })}
      </div>

      {isEditMode && (
        <button
          type="button"
          aria-label={t('pageIndicator.addPage')}
          onClick={onAddPage}
          className="rounded-full bg-surface-raised px-2 py-1 text-xs font-medium text-surface-muted hover:text-surface-text"
        >
          {t('pageIndicator.addPage')}
        </button>
      )}
    </div>
  )
}
