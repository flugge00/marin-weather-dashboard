import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchNearestSeaLevel } from '../../lib/smhi/seaLevelClient'
import { useLocale } from '../../state/locale/context'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'
import { TrendArrow } from '../shared/TrendArrow'

/** cm/hour below which the trend reads as "steady" rather than rising/falling. */
const FLAT_THRESHOLD_CM_PER_HOUR = 0.5

/** Nearest-station sea level widget: current level (cm) + rising/falling trend. */
export function SeaLevelWidget() {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const { t } = useLocale()
  const coords = config.coords

  const { data, status, loading, lastSyncedAt } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchNearestSeaLevel(coords, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  if (!coords) return <MissingAddressNotice />

  const direction =
    data?.trendCmPerHour == null
      ? null
      : Math.abs(data.trendCmPerHour) < FLAT_THRESHOLD_CM_PER_HOUR
        ? 'flat'
        : data.trendCmPerHour > 0
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
              {data.levelCm >= 0 ? '+' : ''}
              {data.levelCm.toFixed(0)}
            </span>
            <span className="text-sm text-surface-muted">cm</span>
          </div>
          {data.trendCmPerHour != null && (
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
                {t('sealevel.trend', {
                  value: `${data.trendCmPerHour >= 0 ? '+' : ''}${data.trendCmPerHour.toFixed(1)}`,
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
            ? t('sealevel.unableToLoad')
            : status === 'ok'
              ? t('sealevel.noStations')
              : t('sealevel.loading')}
        </p>
      )}
    </div>
  )
}
