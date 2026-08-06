import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import {
  fetchForecast,
  getCurrentConditions,
} from '../../lib/smhi/forecastClient'
import { describeWeatherSymbol } from '../../lib/smhi/weatherSymbol'
import type { ForecastPoint } from '../../lib/smhi/types'
import { degreesToCompass } from '../../lib/format/compass'
import { useLocale } from '../../state/locale/context'
import type { TranslateFn } from '../../state/locale/context'
import { weatherSymbolKey } from '../../state/locale/translations'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'
import { WeatherIcon } from '../shared/WeatherIcon'
import { WindArrow } from '../shared/WindArrow'
import { parseWeatherFieldSettings, type WeatherFieldKey } from './weatherFields'

function fieldValue(key: WeatherFieldKey, point: ForecastPoint, t: TranslateFn): string {
  switch (key) {
    case 'temperature':
      return point.temperatureC != null
        ? `${Math.round(point.temperatureC)}°C`
        : '—'
    case 'wind':
      return point.windSpeedMs != null
        ? `${point.windSpeedMs.toFixed(1)} m/s`
        : '—'
    case 'windGust':
      return point.windGustMs != null
        ? `${point.windGustMs.toFixed(1)} m/s`
        : '—'
    case 'windDirection':
      return point.windDirectionDeg != null
        ? degreesToCompass(point.windDirectionDeg)
        : '—'
    case 'condition':
      return point.symbolCode != null
        ? t(weatherSymbolKey(describeWeatherSymbol(point.symbolCode).code))
        : '—'
  }
}

/** Current-conditions widget (task 4.2), field visibility/order from settings (task 4.3). */
export function WeatherWidget({
  settings,
}: {
  settings: Record<string, unknown>
}) {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const { t } = useLocale()
  const coords = config.coords
  const fields = parseWeatherFieldSettings(settings)

  const FIELD_LABEL: Record<WeatherFieldKey, string> = {
    temperature: t('weather.field.temperature'),
    wind: t('weather.field.wind'),
    windGust: t('weather.field.windGust'),
    windDirection: t('weather.field.windDirection'),
    condition: t('weather.field.condition'),
  }

  const { data, status, loading, lastSyncedAt } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchForecast(coords.lat, coords.lon, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  if (!coords) return <MissingAddressNotice />

  const current = data ? getCurrentConditions(data) : null
  const condition =
    current?.symbolCode != null
      ? describeWeatherSymbol(current.symbolCode)
      : null

  return (
    <div className="flex h-full w-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        {condition ? (
          <WeatherIcon category={condition.category} className="h-9 w-9" />
        ) : (
          <span className="text-2xl text-surface-muted">—</span>
        )}
        <SyncStatusBadge status={status} lastSyncedAt={lastSyncedAt} loading={loading} />
      </div>

      {!current ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {status === 'error' ? t('weather.unableToLoad') : t('weather.loading')}
        </p>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-1">
          {fields
            .filter((field) => field.visible)
            .map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-surface-muted">
                  {FIELD_LABEL[field.key]}
                </span>
                <span className="flex items-center gap-1.5 text-lg font-semibold tabular-nums">
                  {field.key === 'windDirection' &&
                    current.windDirectionDeg != null && (
                      <WindArrow
                        directionDeg={current.windDirectionDeg}
                        className="h-4 w-4 shrink-0 text-surface-muted"
                      />
                    )}
                  {field.key === 'condition' && condition && (
                    <WeatherIcon
                      category={condition.category}
                      className="h-5 w-5 shrink-0"
                    />
                  )}
                  {fieldValue(field.key, current, t)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
