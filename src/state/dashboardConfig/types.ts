export interface WidgetLayout {
  x: number
  y: number
  w: number
  h: number
}

export interface WidgetConfig {
  id: string
  type: string
  layout: WidgetLayout
  settings: Record<string, unknown>
}

export interface DashboardPageConfig {
  widgets: WidgetConfig[]
}

export interface DashboardCoords {
  lat: number
  lon: number
}

export interface DashboardConfig {
  id: string
  name: string
  address: string
  coords: DashboardCoords | null
  pages: DashboardPageConfig[]
}

/** Lightweight listing entry, used by the dashboard manager UI so it doesn't need to load every full config. */
export interface DashboardSummary {
  id: string
  name: string
}
