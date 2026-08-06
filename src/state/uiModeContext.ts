import { createContext, useContext } from 'react'

export type UIMode = 'kiosk' | 'edit'

export interface UIModeContextValue {
  mode: UIMode
  isEditMode: boolean
  toggleMode: () => void
  setMode: (mode: UIMode) => void
}

export const UIModeContext = createContext<UIModeContextValue | null>(null)

export function useUIMode(): UIModeContextValue {
  const ctx = useContext(UIModeContext)
  if (!ctx) {
    throw new Error('useUIMode must be used within a UIModeProvider')
  }
  return ctx
}
