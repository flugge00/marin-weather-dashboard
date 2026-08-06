import { createContext, useContext } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'

export type TranslateFn = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return ctx
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const template: string = translations[locale][key] ?? translations.en[key]
  if (!vars) return template
  return Object.entries(vars).reduce<string>(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
    template,
  )
}
