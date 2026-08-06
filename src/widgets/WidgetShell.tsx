import type { ReactNode } from 'react'
import { useLocale } from '../state/locale/context'
import { useUIMode } from '../state/uiModeContext'

interface WidgetShellProps {
  title: string
  /** Per-widget setting (task 6.8): show the title bar in kiosk mode too. */
  showHeader: boolean
  /**
   * Per-widget setting (task 6.1.4): scales the content pane's font size,
   * padding, and margins together (via CSS transform) so a widget shrunk
   * too small in the grid can still be made to fit by dialing this down,
   * or a large one filled out by dialing it up. 1 = no scaling.
   */
  contentScale: number
  onSettings: () => void
  onRemove: () => void
  children: ReactNode
}

/**
 * Chrome around every grid item: a single title-bar header, shared by kiosk
 * mode (task 6.8, shown only when `showHeader` is on) and edit mode (always
 * shown, since it doubles as the drag handle and carries the gear/remove
 * buttons). Using one bar - rather than a separate always-there kiosk header
 * plus a separate edit-mode bar stacked on top of it - is what keeps the
 * layout from double-stacking or jumping vertically when edit mode toggles
 * (tasks 6.11/6.13); the content pane below is always `min-h-0 flex-1`, so
 * it's given exactly the remaining space and never overlaps or clips
 * against the header, whether or not the header happens to be visible.
 *
 * The `.widget-drag-handle`/`.widget-shell-button` class names are read by
 * WidgetGrid's react-grid-layout dragConfig (handle/cancel selectors) so
 * only the bar - not its buttons - starts a drag.
 */
export function WidgetShell({
  title,
  showHeader,
  contentScale,
  onSettings,
  onRemove,
  children,
}: WidgetShellProps) {
  const { isEditMode } = useUIMode()
  const { t } = useLocale()
  const headerVisible = isEditMode || showHeader

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-raised transition-colors duration-500">
      {headerVisible && (
        <div
          className={`flex h-8 shrink-0 items-center justify-between gap-2 border-b border-surface-border px-3 ${
            isEditMode
              ? 'widget-drag-handle cursor-grab active:cursor-grabbing'
              : ''
          }`}
        >
          <span className="truncate text-xs font-medium text-surface-muted">
            {title}
          </span>
          {isEditMode && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label={t('widgetShell.settingsAria', { title })}
                onClick={onSettings}
                className="widget-shell-button rounded-md px-1.5 py-1 text-xs text-surface-muted hover:bg-surface-base hover:text-surface-text"
              >
                ⚙
              </button>
              <button
                type="button"
                aria-label={t('widgetShell.removeAria', { title })}
                onClick={onRemove}
                className="widget-shell-button rounded-md px-1.5 py-1 text-xs text-surface-muted hover:bg-surface-base hover:text-[color:var(--color-status-error)]"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        {contentScale !== 1 ? (
          <div
            style={{
              width: `${100 / contentScale}%`,
              height: `${100 / contentScale}%`,
              transform: `scale(${contentScale})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
