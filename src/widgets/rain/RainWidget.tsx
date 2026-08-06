import { useState } from 'react'
import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchForecast } from '../../lib/smhi/forecastClient'
import type { ForecastPoint } from '../../lib/smhi/types'
import { useLocale } from '../../state/locale/context'
import {
  isForecastRange,
  RANGE_HOURS,
  RANGE_OPTIONS,
  type ForecastRange,
} from '../forecast/forecastRange'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { selectStripPoints } from '../shared/forecastStrip'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'

const MAX_BARS = 12

const hourFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: '2-digit',
})

// Sequential single-hue ramp (brand blue, light -> dark) keyed to risk
// magnitude, per the dataviz skill's "sequential = one hue" rule.
const RISK_STEPS: { max: number; color: string }[] = [
  { max: 20, color: 'var(--color-brand-200)' },
  { max: 40, color: 'var(--color-brand-300)' },
  { max: 60, color: 'var(--color-brand-400)' },
  { max: 80, color: 'var(--color-brand-500)' },
  { max: Infinity, color: 'var(--color-brand-700)' },
]

function riskColor(pct: number): string {
  return (RISK_STEPS.find((step) => pct <= step.max) ?? RISK_STEPS[RISK_STEPS.length - 1]).color
}

const GRID_LINES = [0, 25, 50, 75, 100]

// Selective direct labels only (never a number on every bar), but a bar
// with meaningful risk still deserves one rather than only the single peak.
const LABEL_THRESHOLD_PCT = 5

/**
 * Rain-risk graph (task 6.1.8): bar chart of SMHI's precipitation
 * probability over time, y-axis = risk %, x-axis = time, with the same
 * 6h/12h/24h/3d/1w range toggle as the forecast widget.
 */
export function RainWidget({
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

  const points: ForecastPoint[] = data
    ? selectStripPoints(data.points, RANGE_HOURS[range], MAX_BARS)
    : []
  const labelFormatter =
    range === '6h' || range === '12h' || range === '24h' ? hourFormatter : dayFormatter

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

      {points.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {status === 'error' ? t('rain.unableToLoad') : t('rain.loading')}
        </p>
      ) : (
        <div className="relative flex flex-1 gap-1.5">
          {/* y-axis gridlines, recessive per the mark spec */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {GRID_LINES.slice()
              .reverse()
              .map((line) => (
                <div
                  key={line}
                  className="border-t border-surface-border/60"
                  style={{ height: 0 }}
                />
              ))}
          </div>

          <div className="relative flex flex-1 items-end gap-1.5">
            {points.map((point) => {
              const pct = Math.max(0, Math.min(100, point.precipitationProbabilityPct ?? 0))
              const showLabel = pct > LABEL_THRESHOLD_PCT
              return (
                <div
                  key={point.time.toISOString()}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                >
                  {showLabel ? (
                    <span className="text-xs font-semibold tabular-nums text-surface-text">
                      {Math.round(pct)}%
                    </span>
                  ) : (
                    <span className="text-xs text-transparent">0%</span>
                  )}
                  <div
                    className="w-full rounded-t-sm transition-[height] duration-500"
                    style={{
                      height: `${Math.max(pct, 2)}%`,
                      backgroundColor: riskColor(pct),
                    }}
                    title={`${labelFormatter.format(point.time)}: ${Math.round(pct)}%`}
                  />
                  <span className="text-[10px] text-surface-muted">
                    {labelFormatter.format(point.time)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
