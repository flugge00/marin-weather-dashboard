import { useState } from 'react'
import { useDashboardConfig } from '../state/dashboardConfig/context'
import { useLocale } from '../state/locale/context'
import { widgetNameKey } from '../state/locale/translations'
import { listWidgetDefinitions } from '../widgets/registry'

export function AddWidgetMenu({ pageIndex }: { pageIndex: number }) {
  const [open, setOpen] = useState(false)
  const { addWidget } = useDashboardConfig()
  const { t } = useLocale()
  const definitions = listWidgetDefinitions()

  return (
    <div className="absolute right-4 bottom-4 z-10 flex flex-col items-end gap-2">
      {open && (
        <div className="w-48 rounded-xl border border-surface-border bg-surface-raised p-2 shadow-lg">
          {definitions.map((definition) => (
            <button
              key={definition.type}
              type="button"
              onClick={() => {
                addWidget(pageIndex, definition.type)
                setOpen(false)
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-surface-text hover:bg-surface-base"
            >
              {t(widgetNameKey(definition.type))}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-brand-600"
      >
        {open ? t('addWidget.close') : t('addWidget.addWidget')}
      </button>
    </div>
  )
}
