import { useLocale } from '../../state/locale/context'

/** Shown by any location-dependent widget until a dashboard address/coords is set (Phase 5.5). */
export function MissingAddressNotice() {
  const { t } = useLocale()
  return (
    <div className="flex h-full w-full items-center justify-center p-4 text-center">
      <p className="text-sm text-surface-muted">{t('missingAddress.notice')}</p>
    </div>
  )
}
