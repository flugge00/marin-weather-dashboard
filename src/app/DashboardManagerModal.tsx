import { useRef, useState } from 'react'
import { useDashboardConfig } from '../state/dashboardConfig/context'
import { isDashboardConfig } from '../state/dashboardConfig/validate'
import { useLocale } from '../state/locale/context'

interface DashboardManagerModalProps {
  onClose: () => void
}

/**
 * Config manager UI (task 3.4): create/rename/duplicate/delete dashboards
 * and switch which one is active, plus export/import as JSON (task 3.5) -
 * the manual workaround for configs not syncing across devices/browsers.
 */
export function DashboardManagerModal({ onClose }: DashboardManagerModalProps) {
  const {
    config,
    summaries,
    renameDashboard,
    createDashboard,
    switchDashboard,
    duplicateDashboard,
    deleteDashboard,
    importDashboard,
  } = useDashboardConfig()
  const { t } = useLocale()

  const [newName, setNewName] = useState('')
  const [renameDraft, setRenameDraft] = useState(config.name)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset the rename draft whenever the active dashboard changes underneath
  // this modal (e.g. the user just clicked another dashboard in the list
  // below) - adjusted during render rather than an effect, per React's
  // guidance for resetting state on prop change.
  const [renderedConfigId, setRenderedConfigId] = useState(config.id)
  if (config.id !== renderedConfigId) {
    setRenderedConfigId(config.id)
    setRenameDraft(config.name)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${config.name.trim() || 'dashboard'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (file: File) => {
    setImportError(null)
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      if (!isDashboardConfig(parsed)) {
        setImportError(t('dashboardManager.importErrorInvalid'))
        return
      }
      importDashboard(parsed)
    } catch {
      setImportError(t('dashboardManager.importErrorParse'))
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="modal-fade-in flex max-h-[80%] w-[28rem] flex-col rounded-2xl border border-surface-border bg-surface-raised p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-base font-semibold">
          {t('dashboardManager.title')}
        </h2>

        <ul className="mb-4 max-h-56 space-y-1 overflow-y-auto">
          {summaries.map((summary) => (
            <li
              key={summary.id}
              className="flex items-center justify-between gap-2 rounded-lg px-1 py-1"
            >
              <button
                type="button"
                onClick={() => switchDashboard(summary.id)}
                className={`flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm ${
                  summary.id === config.id
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-text hover:bg-surface-base'
                }`}
              >
                {summary.name}
              </button>
              <button
                type="button"
                aria-label={t('dashboardManager.duplicateAria', {
                  name: summary.name,
                })}
                onClick={() => duplicateDashboard(summary.id)}
                className="rounded-md px-1.5 py-1 text-xs text-surface-muted hover:bg-surface-base hover:text-surface-text"
              >
                {t('dashboardManager.duplicate')}
              </button>
              <button
                type="button"
                aria-label={t('dashboardManager.deleteAria', {
                  name: summary.name,
                })}
                onClick={() => deleteDashboard(summary.id)}
                disabled={summaries.length <= 1}
                className="rounded-md px-1.5 py-1 text-xs text-surface-muted hover:bg-surface-base hover:text-[color:var(--color-status-error)] disabled:opacity-30"
              >
                {t('dashboardManager.delete')}
              </button>
            </li>
          ))}
        </ul>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-surface-muted">
            {t('dashboardManager.activeDashboardName')}
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={renameDraft}
              onChange={(event) => setRenameDraft(event.target.value)}
              className="flex-1 rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-surface-text"
            />
            <button
              type="button"
              onClick={() => {
                if (renameDraft.trim()) renameDashboard(renameDraft.trim())
              }}
              className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              {t('dashboardManager.rename')}
            </button>
          </div>
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-surface-muted">
            {t('dashboardManager.createNewDashboard')}
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder={t('dashboardManager.dashboardNamePlaceholder')}
              className="flex-1 rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-surface-text"
            />
            <button
              type="button"
              onClick={() => {
                if (!newName.trim()) return
                createDashboard(newName.trim())
                setNewName('')
              }}
              className="rounded-lg bg-surface-base px-3 py-2 text-sm font-medium text-surface-text hover:bg-brand-800"
            >
              {t('dashboardManager.create')}
            </button>
          </div>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 rounded-lg bg-surface-base px-3 py-2 text-sm font-medium text-surface-text hover:bg-brand-800"
          >
            {t('dashboardManager.exportJson')}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded-lg bg-surface-base px-3 py-2 text-sm font-medium text-surface-text hover:bg-brand-800"
          >
            {t('dashboardManager.importJson')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleImportFile(file)
              event.target.value = ''
            }}
          />
        </div>
        {importError && (
          <p className="mt-2 text-xs text-[color:var(--color-status-error)]">
            {importError}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 self-end rounded-lg px-3 py-1.5 text-sm text-surface-muted hover:text-surface-text"
        >
          {t('dashboardManager.close')}
        </button>
      </div>
    </div>
  )
}
