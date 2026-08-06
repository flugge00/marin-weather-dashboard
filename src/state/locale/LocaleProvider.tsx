import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { readJson, writeJson } from '../../lib/storage/localStorageJson'
import { LocaleContext, translate } from './context'
import type { Locale } from './translations'

const LOCALE_KEY = 'marin-dashboard:settings:locale'

function detectDefaultLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('sv') ? 'sv' : 'en'
}

/** Device-level language choice (Swedish/English), persisted like the other AppSettings. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(
    () => readJson<Locale>(LOCALE_KEY) ?? detectDefaultLocale(),
  )

  const setLocale = useCallback((next: Locale) => {
    writeJson(LOCALE_KEY, next)
    setLocaleState(next)
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) =>
        translate(locale, key, vars),
    }),
    [locale, setLocale],
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}
