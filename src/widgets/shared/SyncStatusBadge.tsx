import { useEffect, useRef, useState } from 'react'
import type { SyncStatus } from '../../lib/dataSource/types'
import { formatRelativeTime } from '../../lib/format/relativeTime'
import { useLocale } from '../../state/locale/context'

interface SyncStatusBadgeProps {
  status: SyncStatus
  lastSyncedAt: number | null
  loading?: boolean
}

const STATUS_COLOR: Record<SyncStatus, string> = {
  ok: 'var(--color-status-ok)',
  stale: 'var(--color-status-stale)',
  error: 'var(--color-status-error)',
}

/**
 * Shared status dot + "last synced" label (task 4.7), driven by whatever a
 * widget's `useDataSource` call returns. Ticks on its own timer so the
 * relative-time label ("3m ago") keeps advancing even when the underlying
 * data hasn't changed.
 */
export function SyncStatusBadge({
  status,
  lastSyncedAt,
  loading,
}: SyncStatusBadgeProps) {
  const { t } = useLocale()
  const [, forceTick] = useState(0)
  const [isPulsing, setIsPulsing] = useState(false)
  const previousSyncedAt = useRef(lastSyncedAt)

  const STATUS_LABEL: Record<SyncStatus, string> = {
    ok: t('syncStatus.synced'),
    stale: t('syncStatus.stale'),
    error: t('syncStatus.error'),
  }

  useEffect(() => {
    const id = setInterval(() => forceTick((tick) => tick + 1), 1_000)
    return () => clearInterval(id)
  }, [])

  // Brief pulse on the status dot whenever a refresh actually lands (task 5.4).
  useEffect(() => {
    if (lastSyncedAt === null || lastSyncedAt === previousSyncedAt.current) {
      return
    }
    previousSyncedAt.current = lastSyncedAt
    setIsPulsing(true)
    const id = setTimeout(() => setIsPulsing(false), 600)
    return () => clearTimeout(id)
  }, [lastSyncedAt])

  return (
    <span className="flex shrink-0 items-center gap-1.5 text-xs text-surface-muted">
      <span
        className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-300 ${isPulsing ? 'sync-pulse' : ''}`}
        style={{ backgroundColor: STATUS_COLOR[status] }}
      />
      {loading ? t('syncStatus.syncing') : STATUS_LABEL[status]}
      {lastSyncedAt !== null && (
        <span>· {formatRelativeTime(lastSyncedAt, t)}</span>
      )}
    </span>
  )
}
