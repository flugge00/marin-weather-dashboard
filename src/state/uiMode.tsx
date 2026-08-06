import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  UIModeContext,
  type UIMode,
  type UIModeContextValue,
} from './uiModeContext'

/**
 * Kiosk is the always-on daily-display mode; edit reveals widget drag
 * handles, add/remove UI, and settings gear icons (Phase 3/4). Not persisted
 * to localStorage on purpose - a kiosk device that reloads or restarts
 * should always come back up clean in kiosk mode, never stuck in edit mode.
 */
export function UIModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<UIMode>('kiosk')

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'kiosk' ? 'edit' : 'kiosk'))
  }, [])

  const value = useMemo<UIModeContextValue>(
    () => ({ mode, isEditMode: mode === 'edit', toggleMode, setMode }),
    [mode, toggleMode],
  )

  return (
    <UIModeContext.Provider value={value}>{children}</UIModeContext.Provider>
  )
}
