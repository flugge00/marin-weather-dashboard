import { useEffect, useRef, useState } from 'react'
import { GridLayout, type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { useDashboardConfig } from '../state/dashboardConfig/context'
import type { WidgetConfig } from '../state/dashboardConfig/types'
import { useLocale } from '../state/locale/context'
import { widgetNameKey } from '../state/locale/translations'
import { useUIMode } from '../state/uiModeContext'
import { getWidgetDefinition } from '../widgets/registry'
import { WidgetShell } from '../widgets/WidgetShell'
import { AddWidgetMenu } from './AddWidgetMenu'
import { WidgetSettingsPanel } from './WidgetSettingsPanel'

const GRID_COLS = 12
const GRID_ROWS = 8
const GRID_GAP = 12

function toLayout(widgets: WidgetConfig[]): Layout {
  return widgets.map((widget) => ({
    i: widget.id,
    x: widget.layout.x,
    y: widget.layout.y,
    w: widget.layout.w,
    h: widget.layout.h,
  }))
}

interface WidgetGridProps {
  pageIndex: number
  widgets: WidgetConfig[]
}

/**
 * Per-page drag/resize widget grid (task 3.1), built on react-grid-layout.
 * The grid is measured against its own container rather than the fixed
 * 1024x768 canvas constant directly, since a page's usable area is the
 * canvas minus the top bar and page indicator - see DashboardCanvas.tsx.
 */
export function WidgetGrid({ pageIndex, widgets }: WidgetGridProps) {
  const { isEditMode } = useUIMode()
  const { updateWidgetLayouts, removeWidget } = useDashboardConfig()
  const { t } = useLocale()

  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [settingsWidgetId, setSettingsWidgetId] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = (width: number, height: number) =>
      setSize({ width, height })
    updateSize(container.clientWidth, container.clientHeight)

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      updateSize(width, height)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const commitLayout = (layout: Layout) => {
    updateWidgetLayouts(
      pageIndex,
      layout.map((item) => ({
        id: item.i,
        layout: { x: item.x, y: item.y, w: item.w, h: item.h },
      })),
    )
  }

  const rowHeight = size.height > 0 ? size.height / GRID_ROWS - GRID_GAP : 0
  const settingsWidget = widgets.find(
    (widget) => widget.id === settingsWidgetId,
  )

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden p-3"
    >
      {size.width > 0 && rowHeight > 0 && (
        <GridLayout
          width={size.width}
          layout={toLayout(widgets)}
          gridConfig={{
            cols: GRID_COLS,
            rowHeight,
            margin: [GRID_GAP, GRID_GAP],
            containerPadding: [0, 0],
            maxRows: GRID_ROWS,
          }}
          dragConfig={{
            enabled: isEditMode,
            handle: '.widget-drag-handle',
            cancel: '.widget-shell-button',
          }}
          resizeConfig={{ enabled: isEditMode }}
          onDragStop={commitLayout}
          onResizeStop={commitLayout}
        >
          {widgets.map((widget) => {
            const definition = getWidgetDefinition(widget.type)
            const Component = definition.component
            return (
              <div key={widget.id}>
                <WidgetShell
                  title={t(widgetNameKey(definition.type))}
                  showHeader={widget.settings.showHeader !== false}
                  onSettings={() => setSettingsWidgetId(widget.id)}
                  onRemove={() => removeWidget(pageIndex, widget.id)}
                >
                  <Component settings={widget.settings} />
                </WidgetShell>
              </div>
            )
          })}
        </GridLayout>
      )}

      {isEditMode && <AddWidgetMenu pageIndex={pageIndex} />}

      {settingsWidget && (
        <WidgetSettingsPanel
          pageIndex={pageIndex}
          widget={settingsWidget}
          onClose={() => setSettingsWidgetId(null)}
        />
      )}
    </div>
  )
}
