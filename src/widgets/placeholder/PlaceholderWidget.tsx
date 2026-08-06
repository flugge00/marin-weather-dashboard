import { useLocale } from '../../state/locale/context'

/**
 * Stand-in widget type that exercises the Phase 3 grid/settings engine end
 * to end before any real widget (Phase 4) exists. Real widgets register in
 * ../registry.ts the same way this one does.
 */
export function PlaceholderWidget({
  settings,
}: {
  settings: Record<string, unknown>
}) {
  const { t } = useLocale()
  const label =
    typeof settings.label === 'string'
      ? settings.label
      : t('placeholderWidget.defaultLabel')

  return (
    <div className="flex h-full w-full items-center justify-center p-4 text-center">
      <p className="text-sm text-surface-muted">{label}</p>
    </div>
  )
}
