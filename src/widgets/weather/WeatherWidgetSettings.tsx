import { useState } from 'react'
import { useLocale } from '../../state/locale/context'
import { weatherFieldMetaKey } from '../../state/locale/translations'
import type { WidgetSettingsProps } from '../types'
import {
  parseWeatherFieldSettings,
  WEATHER_FIELDS,
  type WeatherFieldKey,
} from './weatherFields'

/** Drag-to-reorder + show/hide list for the weather widget's fields (task 4.3). */
export function WeatherWidgetSettings({
  settings,
  onChange,
}: WidgetSettingsProps) {
  const { t } = useLocale()
  const fields = parseWeatherFieldSettings(settings)
  const [dragKey, setDragKey] = useState<WeatherFieldKey | null>(null)

  const reorder = (from: WeatherFieldKey, to: WeatherFieldKey) => {
    if (from === to) return
    const fromIndex = fields.findIndex((field) => field.key === from)
    const toIndex = fields.findIndex((field) => field.key === to)
    const next = [...fields]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onChange({ ...settings, fields: next })
  }

  const toggleVisible = (key: WeatherFieldKey) => {
    const next = fields.map((field) =>
      field.key === key ? { ...field, visible: !field.visible } : field,
    )
    onChange({ ...settings, fields: next })
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1 text-xs text-surface-muted">
        {t('weatherSettings.dragToReorder')}
      </p>
      {fields.map((field) => {
        const meta = WEATHER_FIELDS.find((item) => item.key === field.key)
        return (
          <div
            key={field.key}
            draggable
            onDragStart={() => setDragKey(field.key)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragKey) reorder(dragKey, field.key)
              setDragKey(null)
            }}
            className="flex cursor-grab items-center gap-2 rounded-lg border border-surface-border bg-surface-base px-3 py-2 active:cursor-grabbing"
          >
            <span className="text-surface-muted">⠿</span>
            <label className="flex flex-1 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.visible}
                onChange={() => toggleVisible(field.key)}
              />
              {meta && t(weatherFieldMetaKey(meta.key))}
            </label>
          </div>
        )
      })}
    </div>
  )
}
