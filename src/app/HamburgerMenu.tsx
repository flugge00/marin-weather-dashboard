import { useEffect, useRef, useState } from 'react'
import { useAppSettings, type ThemeMode } from '../state/appSettings/context'
import { useLocale } from '../state/locale/context'
import { LOCALES } from '../state/locale/translations'
import { triggerGlobalRefresh } from '../state/refreshBus'

/**
 * Hidden hamburger menu (tasks 6.9/6.10/6.14): force-refresh every widget's
 * data at once, set how often widgets poll (decimal minutes allowed), and
 * pick the light/dark/auto palette. Available in both kiosk and edit mode -
 * these are viewing preferences, not layout edits. Also holds the personal
 * aisstream.io API key for the minimap's boat-traffic feed (task 8.3) - a
 * device credential, not dashboard config.
 */
export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const {
    refreshIntervalMs,
    setRefreshIntervalMinutes,
    themeMode,
    setThemeMode,
    aisApiKey,
    setAisApiKey,
  } = useAppSettings()
  const { locale, setLocale, t } = useLocale()
  const [aisKeyDraft, setAisKeyDraft] = useState(aisApiKey ?? '')

  const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
    { key: 'auto', label: t('hamburger.theme.auto') },
    { key: 'light', label: t('hamburger.theme.light') },
    { key: 'dark', label: t('hamburger.theme.dark') },
  ]
  const [intervalDraft, setIntervalDraft] = useState(() =>
    String(refreshIntervalMs / 60_000),
  )
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset the draft whenever the committed interval changes underneath this
  // menu (e.g. another tab/reload changed it) - adjusted during render
  // rather than an effect, same pattern as DashboardManagerModal's rename
  // draft reset.
  const [renderedIntervalMs, setRenderedIntervalMs] =
    useState(refreshIntervalMs)
  if (refreshIntervalMs !== renderedIntervalMs) {
    setRenderedIntervalMs(refreshIntervalMs)
    setIntervalDraft(String(refreshIntervalMs / 60_000))
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const commitInterval = () => {
    const minutes = Number(intervalDraft)
    if (Number.isFinite(minutes) && minutes > 0) {
      setRefreshIntervalMinutes(minutes)
    } else {
      setIntervalDraft(String(refreshIntervalMs / 60_000))
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t('hamburger.settingsMenu')}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-surface-raised px-3 py-1.5 text-sm text-surface-muted hover:text-surface-text"
      >
        ☰
      </button>

      {open && (
        <div className="modal-fade-in absolute top-full right-0 z-40 mt-2 w-64 rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              triggerGlobalRefresh()
              setOpen(false)
            }}
            className="mb-4 w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {t('hamburger.refreshAllNow')}
          </button>

          <label className="mb-4 block text-sm">
            <span className="mb-1 block text-surface-muted">
              {t('hamburger.refreshInterval')}
            </span>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={intervalDraft}
              onChange={(event) => setIntervalDraft(event.target.value)}
              onBlur={commitInterval}
              className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-surface-text"
            />
          </label>

          <div className="mb-4 text-sm">
            <span className="mb-1 block text-surface-muted">
              {t('hamburger.appearance')}
            </span>
            <div className="flex flex-col gap-1">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setThemeMode(option.key)}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm ${
                    themeMode === option.key
                      ? 'bg-brand-500 text-white'
                      : 'text-surface-text hover:bg-surface-base'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="mb-4 block text-sm">
            <span className="mb-1 block text-surface-muted">
              {t('hamburger.aisApiKey')}
            </span>
            <input
              type="password"
              value={aisKeyDraft}
              placeholder={t('hamburger.aisApiKeyPlaceholder')}
              onChange={(event) => setAisKeyDraft(event.target.value)}
              onBlur={() => setAisApiKey(aisKeyDraft)}
              className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-surface-text"
            />
            <span className="mt-1 block text-xs text-surface-muted">
              {t('hamburger.aisApiKeyHint')}
            </span>
          </label>

          <div className="text-sm">
            <span className="mb-1 block text-surface-muted">
              {t('hamburger.language')}
            </span>
            <div className="flex flex-col gap-1">
              {LOCALES.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setLocale(option.key)}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm ${
                    locale === option.key
                      ? 'bg-brand-500 text-white'
                      : 'text-surface-text hover:bg-surface-base'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
