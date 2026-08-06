import { useLocale } from '../../state/locale/context'
import type { WidgetSettingsProps } from '../types'

export function PlaceholderWidgetSettings({
  settings,
  onChange,
}: WidgetSettingsProps) {
  const { t } = useLocale()
  const label = typeof settings.label === 'string' ? settings.label : ''

  return (
    <label className="block text-sm">
      <span className="mb-1 block text-surface-muted">
        {t('placeholderSettings.label')}
      </span>
      <input
        type="text"
        value={label}
        onChange={(event) =>
          onChange({ ...settings, label: event.target.value })
        }
        className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-surface-text"
      />
    </label>
  )
}
