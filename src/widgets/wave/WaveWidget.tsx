import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchNearestWave } from '../../lib/smhi/waveClient'
import { useLocale } from '../../state/locale/context'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'

/**
 * Nearest-buoy wave height/period widget. SMHI's buoy network is sparse
 * (~5 stations nationwide, all offshore) - there's no public SMHI wave
 * *forecast* API, only these observations, so `distanceKm` is shown
 * prominently since "nearest" can still be far for many coastal addresses.
 */
export function WaveWidget() {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const { t } = useLocale()
  const coords = config.coords

  const { data, status, loading, lastSyncedAt } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchNearestWave(coords, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  if (!coords) return <MissingAddressNotice />

  return (
    <div className="flex h-full w-full flex-col gap-2 p-4">
      <div className="flex justify-end">
        <SyncStatusBadge status={status} lastSyncedAt={lastSyncedAt} loading={loading} />
      </div>

      {data ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums">
                  {data.heightM.toFixed(1)}
                </span>
                <span className="text-sm text-surface-muted">m</span>
              </div>
              <span className="text-xs text-surface-muted">{t('wave.height')}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums">
                  {data.periodS != null ? data.periodS.toFixed(0) : '—'}
                </span>
                {data.periodS != null && (
                  <span className="text-sm text-surface-muted">s</span>
                )}
              </div>
              <span className="text-xs text-surface-muted">{t('wave.period')}</span>
            </div>
          </div>
          <span className="text-sm text-surface-muted">
            {data.station.name} · {data.distanceKm.toFixed(0)} km
          </span>
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {status === 'error'
            ? t('wave.unableToLoad')
            : status === 'ok'
              ? t('wave.noStations')
              : t('wave.loading')}
        </p>
      )}
    </div>
  )
}
