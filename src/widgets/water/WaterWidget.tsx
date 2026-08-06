import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchNearestWaterTemperature } from '../../lib/smhi/waterTemperatureClient'
import { useLocale } from '../../state/locale/context'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'

/** Nearest-station water temperature widget (task 4.4). */
export function WaterWidget() {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const { t } = useLocale()
  const coords = config.coords

  const { data, status, loading, lastSyncedAt } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchNearestWaterTemperature(coords, { signal })
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
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <span className="text-3xl font-semibold tabular-nums">
            {data.temperatureC.toFixed(1)}°C
          </span>
          <span className="text-sm text-surface-muted">
            {data.station.name} · {data.distanceKm.toFixed(1)} km
          </span>
        </div>
      ) : (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {status === 'error'
            ? t('water.unableToLoad')
            : status === 'ok'
              ? t('water.noStations')
              : t('water.loading')}
        </p>
      )}
    </div>
  )
}
