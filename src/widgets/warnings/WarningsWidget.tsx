import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchWarningsNear, type WarningLevel } from '../../lib/smhi/warningsClient'
import { useLocale } from '../../state/locale/context'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { SyncStatusBadge } from '../shared/SyncStatusBadge'

const LEVEL_COLOR: Record<WarningLevel, string> = {
  MESSAGE: 'var(--color-surface-muted)',
  YELLOW: 'var(--color-status-stale)',
  ORANGE: 'var(--color-status-orange)',
  RED: 'var(--color-status-error)',
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** Active SMHI warnings (county + marine sea-district) for the dashboard's location, most severe first. */
export function WarningsWidget() {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const { locale, t } = useLocale()
  const coords = config.coords

  const { data, status, loading, lastSyncedAt } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchWarningsNear(coords, locale, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  if (!coords) return <MissingAddressNotice />

  return (
    <div className="flex h-full w-full flex-col gap-2 p-3">
      <div className="flex justify-end">
        <SyncStatusBadge status={status} lastSyncedAt={lastSyncedAt} loading={loading} />
      </div>

      {!data ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {status === 'error' ? t('warnings.unableToLoad') : t('warnings.loading')}
        </p>
      ) : data.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-surface-muted">
          {t('warnings.none')}
        </p>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {data.map((warning) => (
            <div
              key={warning.id}
              className="flex gap-2 rounded-lg border border-surface-border bg-surface-raised p-2"
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: LEVEL_COLOR[warning.level] }}
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {warning.areaName} · {warning.eventTitle}
                  </span>
                  <span className="shrink-0 text-xs text-surface-muted">
                    {warning.levelLabel}
                  </span>
                </div>
                <span className="text-xs text-surface-muted">
                  {warning.eventDescription}
                </span>
                {warning.start && (
                  <span className="text-[10px] text-surface-muted">
                    {timeFormatter.format(warning.start)}
                    {warning.end ? ` – ${timeFormatter.format(warning.end)}` : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
