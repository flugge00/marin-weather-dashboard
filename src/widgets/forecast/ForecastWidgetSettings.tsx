import { useLocale } from '../../state/locale/context'
import type { WidgetSettingsProps } from '../types'
import { isForecastRange, RANGE_OPTIONS } from './forecastRange'

/** Lets the user pick which range the forecast strip opens on. */
export function ForecastWidgetSettings({
  settings,
  onChange,
}: WidgetSettingsProps) {
  const { t } = useLocale()
  const defaultRange = isForecastRange(settings.defaultRange)
    ? settings.defaultRange
    : '24h'

  return (
    <label className="block text-sm">
      <span className="mb-1 block text-surface-muted">
        {t('forecastSettings.defaultRange')}
      </span>
      <select
        value={defaultRange}
        onChange={(event) =>
          onChange({ ...settings, defaultRange: event.target.value })
        }
        className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-surface-text"
      >
        {RANGE_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
