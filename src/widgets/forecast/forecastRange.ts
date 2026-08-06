export type ForecastRange = '12h' | '24h' | '3d' | '1w'

export const RANGE_OPTIONS: { key: ForecastRange; label: string }[] = [
  { key: '12h', label: '12h' },
  { key: '24h', label: '24h' },
  { key: '3d', label: '3d' },
  { key: '1w', label: '1w' },
]

export const RANGE_HOURS: Record<ForecastRange, number> = {
  '12h': 12,
  '24h': 24,
  '3d': 72,
  '1w': 168,
}

export function isForecastRange(value: unknown): value is ForecastRange {
  return typeof value === 'string' && value in RANGE_HOURS
}

export const DEFAULT_FORECAST_SETTINGS: Record<string, unknown> = {
  defaultRange: '24h' satisfies ForecastRange,
}
