import { useState } from 'react'
import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchForecast } from '../../lib/smhi/forecastClient'
import { describeWeatherSymbol } from '../../lib/smhi/weatherSymbol'
import type { ForecastPoint } from '../../lib/smhi/types'
import { useLocale } from '../../state/locale/context'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'
import { WeatherIcon } from '../shared/WeatherIcon'
import {
  isForecastRange,
  RANGE_HOURS,
  RANGE_OPTIONS,
  type ForecastRange,
} from './forecastRange'

const MAX_STRIP_ITEMS = 8

function selectStripPoints(
  points: ForecastPoint[],
  rangeHours: number,
): ForecastPoint[] {
  const cutoff = Date.now() + rangeHours * 60 * 60 * 1000
  const inRange = points.filter((point) => point.time.getTime() <= cutoff)
  if (inRange.length <= MAX_STRIP_ITEMS) return inRange

  const step = Math.ceil(inRange.length / MAX_STRIP_ITEMS)
  return inRange.filter((_, index) => index % step === 0).slice(0, MAX_STRIP_ITEMS)
}

const hourFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: '2-digit',
})

/** Compact multi-point forecast strip with a 12h/24h/3d/1w range selector (task 4.5). */
export function ForecastWidget({
  settings,
}: {
  settings: Record<string, unknown>
}) {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const { t } = useLocale()
  const coords = config.coords
  const initialRange = isForecastRange(settings.defaultRange)
    ? settings.defaultRange
    : '24h'
  const [range, setRange] = useState<ForecastRange>(initialRange)

  const { data, status, loading, lastSyncedAt } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchForecast(coords.lat, coords.lon, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  if (!coords) return <MissingAddressNotice />

  const stripPoints = data ? selectStripPoints(data.points, RANGE_HOURS[range]) : []
  const labelFormatter = range === '12h' || range === '24h' ? hourFormatter : dayFormatter

  return (
    <div className="flex h-full w-full flex-col gap-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              className={
                range === option.key
                  ? 'rounded-md bg-brand-500 px-2 py-1 text-xs font-medium text-white'
                  : 'rounded-md px-2 py-1 text-xs font-medium text-surface-muted hover:bg-surface-base'
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <SyncStatusBadge status={status} lastSyncedAt={lastSyncedAt} loading={loading} />
      </div>

      {stripPoints.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {status === 'error' ? t('forecast.unableToLoad') : t('forecast.loading')}
        </p>
      ) : (
        <div className="grid flex-1 grid-flow-col auto-cols-fr items-center gap-1 overflow-hidden">
          {stripPoints.map((point) => {
            const condition =
              point.symbolCode != null
                ? describeWeatherSymbol(point.symbolCode)
                : null
            return (
              <div
                key={point.time.toISOString()}
                className="flex flex-col items-center gap-0.5 text-center"
              >
                <span className="text-xs text-surface-muted">
                  {labelFormatter.format(point.time)}
                </span>
                {condition ? (
                  <WeatherIcon category={condition.category} className="h-6 w-6" />
                ) : (
                  <span className="text-lg text-surface-muted">—</span>
                )}
                <span className="text-sm font-semibold tabular-nums">
                  {point.temperatureC != null
                    ? `${Math.round(point.temperatureC)}°`
                    : '—'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
