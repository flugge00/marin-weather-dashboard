import type { DashboardConfig } from './types'

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
