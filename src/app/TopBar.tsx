import { useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from '../lib/connectivity/useOnlineStatus'
import { useLocale } from '../state/locale/context'
import { useUIMode } from '../state/uiModeContext'
import { Clock } from './Clock'
import { HamburgerMenu } from './HamburgerMenu'

interface TopBarProps {
  dashboardName: string
  address: string
  onOpenDashboards: () => void
  onOpenAddressSetup: () => void
}

export function TopBar({
  dashboardName,
  address,
  onOpenDashboards,
  onOpenAddressSetup,
}: TopBarProps) {
  const isOnline = useOnlineStatus()
  const { isEditMode, toggleMode } = useUIMode()
  const { t } = useLocale()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border px-6">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="min-w-0 truncate text-base font-semibold">{dashboardName}</h1>
        {address && <ShortAddress address={address} />}
        <ConnectivityDot isOnline={isOnline} />
      </div>

      <div className="flex items-center gap-4">
        {isEditMode && (
          <button
            type="button"
            onClick={onOpenAddressSetup}
            className="rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-surface-muted hover:text-surface-text"
          >
            {address ? t('topBar.changeAddress') : t('topBar.setAddress')}
          </button>
        )}
        {isEditMode && (
          <button
            type="button"
            onClick={onOpenDashboards}
            className="rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-surface-muted hover:text-surface-text"
          >
            {t('topBar.dashboards')}
          </button>
        )}
        <Clock />
        <HamburgerMenu />
        <button
          type="button"
          onClick={toggleMode}
          aria-pressed={isEditMode}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            isEditMode
              ? 'bg-brand-500 text-white'
              : 'bg-surface-raised text-surface-muted hover:text-surface-text'
          }`}
        >
          {isEditMode ? t('topBar.done') : t('topBar.edit')}
        </button>
      </div>
    </header>
  )
}

/**
 * Address is shown collapsed to its first comma-separated segment (task 6.6)
 * so a long address can't push the edit-mode buttons around; hover (title
 * attribute) or tap reveals the full address.
 */
function ShortAddress({ address }: { address: string }) {
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const shortAddress = address.split(',')[0].trim() || address

  useEffect(() => {
    if (!expanded) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setExpanded(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expanded])

  return (
    <span ref={containerRef} className="relative">
      <button
        type="button"
        title={address}
        onClick={() => setExpanded((prev) => !prev)}
        className="max-w-40 truncate rounded px-1 text-left text-xs text-surface-muted hover:text-surface-text"
      >
        {shortAddress}
      </button>
      {expanded && (
        <span className="modal-fade-in absolute top-full left-0 z-40 mt-1 max-w-64 rounded-lg border border-surface-border bg-surface-raised px-2 py-1 text-xs whitespace-normal text-surface-text shadow-lg">
          {address}
        </span>
      )}
    </span>
  )
}

function ConnectivityDot({ isOnline }: { isOnline: boolean }) {
  const { t } = useLocale()
  const label = isOnline ? t('topBar.online') : t('topBar.offline')
  return (
    <span
      className="flex items-center gap-1.5 text-xs text-surface-muted"
      title={label}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: isOnline
            ? 'var(--color-status-ok)'
            : 'var(--color-status-error)',
        }}
      />
      {label}
    </span>
  )
}
