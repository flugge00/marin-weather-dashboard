import { createContext, useContext } from 'react'
import type {
  DashboardConfig,
  DashboardCoords,
  DashboardSummary,
  WidgetLayout,
} from './types'

export interface DashboardConfigContextValue {
  /** The currently active/displayed dashboard. */
  config: DashboardConfig
  /** All dashboards saved on this device, for the dashboard manager UI. */
  summaries: DashboardSummary[]

  renameDashboard: (name: string) => void
  setAddress: (address: string, coords: DashboardCoords | null) => void

  createDashboard: (name: string) => void
  switchDashboard: (id: string) => void
  duplicateDashboard: (id: string) => void
  deleteDashboard: (id: string) => void
  importDashboard: (config: DashboardConfig) => void

  addPage: () => void
  removePage: (pageIndex: number) => void

  addWidget: (pageIndex: number, type: string) => void
  removeWidget: (pageIndex: number, widgetId: string) => void
  updateWidgetLayouts: (
    pageIndex: number,
    layouts: { id: string; layout: WidgetLayout }[],
  ) => void
  updateWidgetSettings: (
    pageIndex: number,
    widgetId: string,
    settings: Record<string, unknown>,
  ) => void
}

export const DashboardConfigContext =
  createContext<DashboardConfigContextValue | null>(null)

export function useDashboardConfig(): DashboardConfigContextValue {
  const ctx = useContext(DashboardConfigContext)
  if (!ctx) {
    throw new Error(
      'useDashboardConfig must be used within a DashboardConfigProvider',
    )
  }
  return ctx
}
