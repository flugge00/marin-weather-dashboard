import { createContext, useContext } from 'react'

export type ThemeMode = 'auto' | 'light' | 'dark'

export interface AppSettingsContextValue {
  refreshIntervalMs: number
  setRefreshIntervalMinutes: (minutes: number) => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
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
