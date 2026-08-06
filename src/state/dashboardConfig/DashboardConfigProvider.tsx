import { useState, type ReactNode } from 'react'
import * as store from '../../lib/storage/dashboardStore'
import { getWidgetDefinition } from '../../widgets/registry'
import { DashboardConfigContext } from './context'
import { createEmptyDashboardConfig } from './defaults'
import type {
  DashboardConfig,
  DashboardCoords,
  DashboardPageConfig,
  DashboardSummary,
  WidgetConfig,
  WidgetLayout,
} from './types'

function mapPage(
  config: DashboardConfig,
  pageIndex: number,
  updater: (page: DashboardPageConfig) => DashboardPageConfig,
): DashboardConfig {
  return {
    ...config,
    pages: config.pages.map((page, index) =>
      index === pageIndex ? updater(page) : page,
    ),
  }
}

export function DashboardConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DashboardConfig>(() =>
    store.ensureActiveDashboard(),
  )
  const [summaries, setSummaries] = useState<DashboardSummary[]>(() =>
    store.listDashboards(),
  )

  const persist = (next: DashboardConfig) => {
    store.saveDashboard(next)
    setConfig(next)
    setSummaries(store.listDashboards())
  }

  const renameDashboard = (name: string) => persist({ ...config, name })

  const setAddress = (address: string, coords: DashboardCoords | null) =>
    persist({ ...config, address, coords })

  const createDashboard = (name: string) => {
    const fresh = createEmptyDashboardConfig(name)
    store.saveDashboard(fresh)
    store.setActiveDashboardId(fresh.id)
    setConfig(fresh)
    setSummaries(store.listDashboards())
  }

  const switchDashboard = (id: string) => {
    const next = store.loadDashboard(id)
    if (!next) return
    store.setActiveDashboardId(id)
    setConfig(next)
  }

  const duplicateDashboard = (id: string) => {
    const source = store.loadDashboard(id)
    if (!source) return
    store.duplicateDashboard(id, `${source.name} copy`)
    setSummaries(store.listDashboards())
  }

  const deleteDashboard = (id: string) => {
    store.deleteDashboard(id)
    const remaining = store.listDashboards()
    setSummaries(remaining)

    if (id === config.id) {
      const fallback = remaining[0]
        ? store.loadDashboard(remaining[0].id)
        : null
      const next = fallback ?? store.ensureActiveDashboard()
      store.setActiveDashboardId(next.id)
      setConfig(next)
    }
  }

  const importDashboard = (imported: DashboardConfig) => {
    const withNewId: DashboardConfig = { ...imported, id: crypto.randomUUID() }
    store.saveDashboard(withNewId)
    store.setActiveDashboardId(withNewId.id)
    setConfig(withNewId)
    setSummaries(store.listDashboards())
  }

  const addPage = () => {
    persist({ ...config, pages: [...config.pages, { widgets: [] }] })
  }

  // A dashboard must always keep at least one page (task 6.12); the UI
  // disables the remove control rather than relying on this no-op.
  const removePage = (pageIndex: number) => {
    if (config.pages.length <= 1) return
    persist({
      ...config,
      pages: config.pages.filter((_, index) => index !== pageIndex),
    })
  }

  const addWidget = (pageIndex: number, type: string) => {
    const definition = getWidgetDefinition(type)
    const widget: WidgetConfig = {
      id: crypto.randomUUID(),
      type,
      layout: { ...definition.defaultLayout },
      settings: { ...definition.defaultSettings },
    }
    persist(
      mapPage(config, pageIndex, (page) => ({
        widgets: [...page.widgets, widget],
      })),
    )
  }

  const removeWidget = (pageIndex: number, widgetId: string) => {
    persist(
      mapPage(config, pageIndex, (page) => ({
        widgets: page.widgets.filter((widget) => widget.id !== widgetId),
      })),
    )
  }

  const updateWidgetLayouts = (
    pageIndex: number,
    layouts: { id: string; layout: WidgetLayout }[],
  ) => {
    const layoutById = new Map(layouts.map((entry) => [entry.id, entry.layout]))
    persist(
      mapPage(config, pageIndex, (page) => ({
        widgets: page.widgets.map((widget) => {
          const layout = layoutById.get(widget.id)
          return layout ? { ...widget, layout } : widget
        }),
      })),
    )
  }

  const updateWidgetSettings = (
    pageIndex: number,
    widgetId: string,
    settings: Record<string, unknown>,
  ) => {
    persist(
      mapPage(config, pageIndex, (page) => ({
        widgets: page.widgets.map((widget) =>
          widget.id === widgetId ? { ...widget, settings } : widget,
        ),
      })),
    )
  }

  return (
    <DashboardConfigContext.Provider
      value={{
        config,
        summaries,
        renameDashboard,
        setAddress,
        createDashboard,
        switchDashboard,
        duplicateDashboard,
        deleteDashboard,
        importDashboard,
        addPage,
        removePage,
        addWidget,
        removeWidget,
        updateWidgetLayouts,
        updateWidgetSettings,
      }}
    >
      {children}
    </DashboardConfigContext.Provider>
  )
}
