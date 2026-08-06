import { useEffect, useState, type ReactNode } from 'react'
import {
  readJson,
  removeJson,
  writeJson,
} from '../../lib/storage/localStorageJson'
import { AppSettingsContext, type ThemeMode } from './context'

const REFRESH_INTERVAL_KEY = 'marin-dashboard:settings:refreshIntervalMs'
const THEME_MODE_KEY = 'marin-dashboard:settings:themeMode'
const AIS_API_KEY_KEY = 'marin-dashboard:settings:aisApiKey'

export const DEFAULT_REFRESH_INTERVAL_MS = 60_000
export const MIN_REFRESH_INTERVAL_MS = 5_000

const DAY_START_HOUR = 7
const DAY_END_HOUR = 20
const AUTO_RECHECK_INTERVAL_MS = 5 * 60 * 1000

function autoTimeOfDayTheme(): 'day' | 'night' {
  const hour = new Date().getHours()
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? 'day' : 'night'
}

/**
 * Device-level settings (not per-dashboard): the polling interval every
 * `useDataSource` call uses (task 6.10) and the light/dark/auto palette
 * choice (task 6.14, extending the time-of-day auto-theme from task 5.2).
 * Both persist in localStorage so they survive a reload.
 */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(
    () => readJson<number>(REFRESH_INTERVAL_KEY) ?? DEFAULT_REFRESH_INTERVAL_MS,
  )
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => readJson<ThemeMode>(THEME_MODE_KEY) ?? 'auto',
  )
  const [aisApiKey, setAisApiKeyState] = useState<string | null>(() =>
    readJson<string>(AIS_API_KEY_KEY),
  )

  const setAisApiKey = (key: string) => {
    const trimmed = key.trim()
    if (trimmed) {
      writeJson(AIS_API_KEY_KEY, trimmed)
    } else {
      removeJson(AIS_API_KEY_KEY)
    }
    setAisApiKeyState(trimmed || null)
  }

  const setRefreshIntervalMinutes = (minutes: number) => {
    if (!Number.isFinite(minutes)) return
    const ms = Math.max(MIN_REFRESH_INTERVAL_MS, Math.round(minutes * 60_000))
    writeJson(REFRESH_INTERVAL_KEY, ms)
    setRefreshIntervalMs(ms)
  }

  const setThemeMode = (mode: ThemeMode) => {
    writeJson(THEME_MODE_KEY, mode)
    setThemeModeState(mode)
  }

  useEffect(() => {
    const apply = () => {
      const resolved =
        themeMode === 'light'
          ? 'day'
          : themeMode === 'dark'
            ? 'night'
            : autoTimeOfDayTheme()
      document.documentElement.dataset.theme = resolved
    }
    apply()
    if (themeMode !== 'auto') return
    const id = setInterval(apply, AUTO_RECHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [themeMode])

  return (
    <AppSettingsContext.Provider
      value={{
        refreshIntervalMs,
        setRefreshIntervalMinutes,
        themeMode,
        setThemeMode,
        aisApiKey,
        setAisApiKey,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}
