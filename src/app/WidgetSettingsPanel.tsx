import { useState } from 'react'
import { useDashboardConfig } from '../state/dashboardConfig/context'
import type { WidgetConfig } from '../state/dashboardConfig/types'
import { useLocale } from '../state/locale/context'
import { widgetNameKey } from '../state/locale/translations'
import { getWidgetDefinition } from '../widgets/registry'

interface WidgetSettingsPanelProps {
  pageIndex: number
  widget: WidgetConfig
  onClose: () => void
}

/**
 * Generic gear-icon settings popover (task 3.6): looks up the widget's
 * `renderSettings` form from the registry and persists whatever it edits.
 * Widgets that need per-field settings (task 4.3) just plug a form into
 * their registry entry - this shell doesn't know or care what's in it.
 */
export function WidgetSettingsPanel({
  pageIndex,
  widget,
  onClose,
}: WidgetSettingsPanelProps) {
  const { updateWidgetSettings } = useDashboardConfig()
  const { t } = useLocale()
  const definition = getWidgetDefinition(widget.type)
  const [draft, setDraft] = useState(widget.settings)
  const SettingsForm = definition.renderSettings
  const showHeader = draft.showHeader !== false

  const handleSave = () => {
    updateWidgetSettings(pageIndex, widget.id, draft)
    onClose()
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="modal-fade-in w-80 rounded-2xl border border-surface-border bg-surface-raised p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-base font-semibold">
          {t('widgetSettings.titleSuffix', {
            title: t(widgetNameKey(definition.type)),
          })}
        </h2>

        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showHeader}
            onChange={(event) =>
              setDraft({ ...draft, showHeader: event.target.checked })
            }
          />
          {t('widgetSettings.showHeader')}
        </label>

        {SettingsForm ? (
          <SettingsForm settings={draft} onChange={setDraft} />
        ) : (
          <p className="text-sm text-surface-muted">
            {t('widgetSettings.noSettings')}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-surface-muted hover:text-surface-text"
          >
            {t('widgetSettings.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            {t('widgetSettings.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
