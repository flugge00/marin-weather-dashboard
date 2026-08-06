import { createContext, useContext } from 'react'

export type ThemeMode = 'auto' | 'light' | 'dark'

export interface AppSettingsContextValue {
  refreshIntervalMs: number
  setRefreshIntervalMinutes: (minutes: number) => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  /**
   * Personal aisstream.io API key for the minimap's boat-traffic feed
   * (Phase 8). Device-level, not part of a dashboard config, so it's never
   * swept up by the JSON export/import (task 3.5) - it's a credential for
   * this browser, not portable dashboard data.
   */
  aisApiKey: string | null
  setAisApiKey: (key: string) => void
}

export const AppSettingsContext = createContext<AppSettingsContextValue | null>(
  null,
)

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider')
  }
  return ctx
}
