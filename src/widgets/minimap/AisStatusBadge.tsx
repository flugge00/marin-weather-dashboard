import type { AisConnectionStatus } from '../../lib/ais/types'
import { useLocale } from '../../state/locale/context'
import type { TranslationKey } from '../../state/locale/translations'

const STATUS_COLOR: Record<AisConnectionStatus, string> = {
  idle: 'var(--color-status-stale)',
  'no-key': 'var(--color-status-stale)',
  connecting: 'var(--color-status-stale)',
  live: 'var(--color-status-ok)',
  error: 'var(--color-status-error)',
}

const STATUS_LABEL_KEY: Record<AisConnectionStatus, TranslationKey> = {
  idle: 'ais.status.idle',
  'no-key': 'ais.status.noKey',
  connecting: 'ais.status.connecting',
  live: 'ais.status.live',
  error: 'ais.status.error',
}

/** Small connection-status pill for the minimap's boat-traffic feed (Phase 8). */
export function AisStatusBadge({ status }: { status: AisConnectionStatus }) {
  const { t } = useLocale()
  if (status === 'idle') return null

  return (
    <span className="absolute top-2 right-2 z-[500] flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-raised/90 px-2 py-1 text-xs font-medium text-surface-text shadow-md">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_COLOR[status] }}
      />
      {t(STATUS_LABEL_KEY[status])}
    </span>
  )
}
