import type { ComponentType } from 'react'
import type { WidgetLayout } from '../state/dashboardConfig/types'
import { ClockWidget } from './clock/ClockWidget'
import { ForecastWidget } from './forecast/ForecastWidget'
import { ForecastWidgetSettings } from './forecast/ForecastWidgetSettings'
import { DEFAULT_FORECAST_SETTINGS } from './forecast/forecastRange'
import { MinimapWidget } from './minimap/MinimapWidget'
import { PlaceholderWidget } from './placeholder/PlaceholderWidget'
import { PlaceholderWidgetSettings } from './placeholder/PlaceholderWidgetSettings'
import type { WidgetSettingsProps } from './types'
import { WaterWidget } from './water/WaterWidget'
import { WeatherWidget } from './weather/WeatherWidget'
import { WeatherWidgetSettings } from './weather/WeatherWidgetSettings'
import { DEFAULT_WEATHER_SETTINGS } from './weather/weatherFields'

export interface WidgetDefinition {
  type: string
  displayName: string
  defaultLayout: WidgetLayout
  defaultSettings: Record<string, unknown>
  component: ComponentType<{ settings: Record<string, unknown> }>
  /** Renders the settings form used by the gear-icon popover (task 3.6). Omit for widgets with nothing to configure. */
  renderSettings?: ComponentType<WidgetSettingsProps>
}

/**
 * Every widget type the grid can place is registered here. Phase 4's real
 * widgets (clock, weather, water, forecast, minimap) add entries the same
 * way `placeholder` does; nothing elsewhere needs to change.
 */
const registry: Record<string, WidgetDefinition> = {
  placeholder: {
    type: 'placeholder',
    displayName: 'Placeholder',
    defaultLayout: { x: 0, y: 0, w: 4, h: 3 },
    defaultSettings: { label: 'New widget' },
    component: PlaceholderWidget,
    renderSettings: PlaceholderWidgetSettings,
  },
  clock: {
    type: 'clock',
    displayName: 'Clock',
    defaultLayout: { x: 0, y: 0, w: 3, h: 2 },
    defaultSettings: {},
    component: ClockWidget,
  },
  weather: {
    type: 'weather',
    displayName: 'Weather',
    defaultLayout: { x: 0, y: 0, w: 4, h: 4 },
    defaultSettings: DEFAULT_WEATHER_SETTINGS,
    component: WeatherWidget,
    renderSettings: WeatherWidgetSettings,
  },
  water: {
    type: 'water',
    displayName: 'Water temperature',
    defaultLayout: { x: 0, y: 0, w: 3, h: 3 },
    defaultSettings: {},
    component: WaterWidget,
  },
  forecast: {
    type: 'forecast',
    displayName: 'Forecast',
    defaultLayout: { x: 0, y: 0, w: 6, h: 3 },
    defaultSettings: DEFAULT_FORECAST_SETTINGS,
    component: ForecastWidget,
    renderSettings: ForecastWidgetSettings,
  },
  minimap: {
    type: 'minimap',
    displayName: 'Minimap',
    defaultLayout: { x: 0, y: 0, w: 5, h: 5 },
    defaultSettings: {},
    component: MinimapWidget,
  },
}

export function listWidgetDefinitions(): WidgetDefinition[] {
  return Object.values(registry)
}

export function getWidgetDefinition(type: string): WidgetDefinition {
  const definition = registry[type]
  if (!definition) {
    throw new Error(`Unknown widget type: ${type}`)
  }
  return definition
}
