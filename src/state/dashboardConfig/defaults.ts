import starterDashboardJson from './starterDashboard.json'
import type { DashboardConfig } from './types'

const starterDashboard = starterDashboardJson as DashboardConfig

/** Two empty pages by default, matching the swipeable multi-page demo from Phase 2. */
export function createEmptyDashboardConfig(name: string): DashboardConfig {
  return {
    id: crypto.randomUUID(),
    name,
    address: '',
    coords: null,
    pages: [{ widgets: [] }, { widgets: [] }],
  }
}

/**
 * First-run starting point: a populated example dashboard (Sandbryggan) so
 * a brand-new install shows the app's widgets in action instead of blank
 * pages. IDs are regenerated so this copy never collides with the template.
 */
export function createStarterDashboardConfig(): DashboardConfig {
  return {
    ...starterDashboard,
    id: crypto.randomUUID(),
    pages: starterDashboard.pages.map((page) => ({
      widgets: page.widgets.map((widget) => ({
        ...widget,
        id: crypto.randomUUID(),
        layout: { ...widget.layout },
        settings: { ...widget.settings },
      })),
    })),
  }
}
