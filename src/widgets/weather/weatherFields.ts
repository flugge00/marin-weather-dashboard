export type WeatherFieldKey =
  | 'temperature'
  | 'wind'
  | 'windGust'
  | 'windDirection'
  | 'condition'

export interface WeatherFieldMeta {
  key: WeatherFieldKey
  label: string
}

export const WEATHER_FIELDS: WeatherFieldMeta[] = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'wind', label: 'Wind speed' },
  { key: 'windGust', label: 'Wind gusts (byar)' },
  { key: 'windDirection', label: 'Wind direction' },
  { key: 'condition', label: 'Sky condition' },
]

export interface WeatherFieldSetting {
  key: WeatherFieldKey
  visible: boolean
}

function isWeatherFieldKey(value: unknown): value is WeatherFieldKey {
  return (
    typeof value === 'string' &&
    WEATHER_FIELDS.some((field) => field.key === value)
  )
}

/**
 * Reads the widget's persisted `fields` order/visibility (task 4.3), falling
 * back to "all fields, default order, all visible" for new/malformed
 * settings, and appending any field the settings blob is missing (e.g. after
 * a future field is added to `WEATHER_FIELDS`).
 */
export function parseWeatherFieldSettings(
  settings: Record<string, unknown>,
): WeatherFieldSetting[] {
  const raw = settings.fields

  if (!Array.isArray(raw)) {
    return WEATHER_FIELDS.map((field) => ({ key: field.key, visible: true }))
  }

  const parsed: WeatherFieldSetting[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const key = (item as Record<string, unknown>).key
    if (!isWeatherFieldKey(key)) continue
    const visible = (item as Record<string, unknown>).visible !== false
    parsed.push({ key, visible })
  }

  const present = new Set(parsed.map((field) => field.key))
  const missing = WEATHER_FIELDS.filter((field) => !present.has(field.key)).map(
    (field) => ({ key: field.key, visible: true }),
  )

  return [...parsed, ...missing]
}

export const DEFAULT_WEATHER_SETTINGS: Record<string, unknown> = {
  fields: WEATHER_FIELDS.map((field) => ({ key: field.key, visible: true })),
}
