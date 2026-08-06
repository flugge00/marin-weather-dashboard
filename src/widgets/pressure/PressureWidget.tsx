import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchNearestPressure } from '../../lib/smhi/pressureClient'
import { useLocale } from '../../state/locale/context'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'
import { TrendArrow } from '../shared/TrendArrow'

/** hPa/3h below which the trend reads as "steady" rather than rising/falling. */
const FLAT_THRESHOLD_HPA_PER_3H = 0.5

/** Nearest-station barometric pressure widget: current hPa + 3h rising/falling trend. */
export function PressureWidget() {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const { t } = useLocale()
  const coords = config.coords

  const { data, status, loading, lastSyncedAt } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchNearestPressure(coords, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  if (!coords) return <MissingAddressNotice />

  const direction =
    data?.trendHPaPer3h == null
      ? null
      : Math.abs(data.trendHPaPer3h) < FLAT_THRESHOLD_HPA_PER_3H
        ? 'flat'
        : data.trendHPaPer3h > 0
          ? 'up'
          : 'down'

  return (
    <div className="flex h-full w-full flex-col gap-2 p-4">
      <div className="flex justify-end">
        <SyncStatusBadge status={status} lastSyncedAt={lastSyncedAt} loading={loading} />
      </div>

      {data ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold tabular-nums">
              {data.hPa.toFixed(0)}
            </span>
            <span className="text-sm text-surface-muted">hPa</span>
          </div>
          {data.trendHPaPer3h != null && (
            <div className="flex items-center gap-1">
              {direction && (
                <TrendArrow
                  direction={direction}
                  className={
                    direction === 'flat'
                      ? 'h-3.5 w-3.5 shrink-0 text-surface-muted'
                      : 'h-3.5 w-3.5 shrink-0 text-brand-400'
                  }
                />
              )}
              <span className="text-xs text-surface-muted">
                {t('pressure.trend', {
                  value: `${data.trendHPaPer3h >= 0 ? '+' : ''}${data.trendHPaPer3h.toFixed(1)}`,
                })}
              </span>
            </div>
          )}
          <span className="text-sm text-surface-muted">
            {data.station.name} · {data.distanceKm.toFixed(1)} km
          </span>
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {status === 'error'
            ? t('pressure.unableToLoad')
            : status === 'ok'
              ? t('pressure.noStations')
              : t('pressure.loading')}
        </p>
      )}
    </div>
  )
}
