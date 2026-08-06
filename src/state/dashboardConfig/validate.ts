import type {
  DashboardConfig,
  DashboardPageConfig,
  WidgetConfig,
  WidgetLayout,
} from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isWidgetLayout(value: unknown): value is WidgetLayout {
  return (
    isRecord(value) &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.w === 'number' &&
    typeof value.h === 'number'
  )
}

function isWidgetConfig(value: unknown): value is WidgetConfig {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    isWidgetLayout(value.layout) &&
    isRecord(value.settings)
  )
}

function isDashboardPageConfig(value: unknown): value is DashboardPageConfig {
  return (
    isRecord(value) &&
    Array.isArray(value.widgets) &&
    value.widgets.every(isWidgetConfig)
  )
}

/**
 * Validates an untrusted parsed-JSON value (e.g. from an imported file) has
 * the shape of a DashboardConfig before it's allowed anywhere near
 * localStorage or the config context - see PLAN.md task 3.5.
 */
export function isDashboardConfig(value: unknown): value is DashboardConfig {
  if (!isRecord(value)) return false
  if (typeof value.id !== 'string' || typeof value.name !== 'string')
    return false
  if (typeof value.address !== 'string') return false

  if (value.coords !== null) {
    if (!isRecord(value.coords)) return false
    if (
      typeof value.coords.lat !== 'number' ||
      typeof value.coords.lon !== 'number'
    ) {
      return false
    }
  }

  return (
    Array.isArray(value.pages) &&
    value.pages.length > 0 &&
    value.pages.every(isDashboardPageConfig)
  )
}
