import { useState } from 'react'
import { useWakeLock } from '../lib/wakeLock/useWakeLock'
import { AppSettingsProvider } from '../state/appSettings/AppSettingsProvider'
import { DashboardConfigProvider } from '../state/dashboardConfig/DashboardConfigProvider'
import { useDashboardConfig } from '../state/dashboardConfig/context'
import { LocaleProvider } from '../state/locale/LocaleProvider'
import { useKeyboardPageNav, usePageNav } from '../state/pageNav'
import { UIModeProvider } from '../state/uiMode'
import { useUIMode } from '../state/uiModeContext'
import { AddressSetupModal } from './AddressSetupModal'
import { DashboardCanvas } from './DashboardCanvas'
import { DashboardManagerModal } from './DashboardManagerModal'
import { PageDeck } from './PageDeck'
import { PageIndicator } from './PageIndicator'
import { TopBar } from './TopBar'
import { WidgetGrid } from './WidgetGrid'

export function DashboardShell() {
  return (
    <LocaleProvider>
      <AppSettingsProvider>
        <UIModeProvider>
          <DashboardConfigProvider>
            <DashboardCanvas>
              <DashboardContent />
            </DashboardCanvas>
          </DashboardConfigProvider>
        </UIModeProvider>
      </AppSettingsProvider>
    </LocaleProvider>
  )
}

function DashboardContent() {
  const { config, addPage, removePage } = useDashboardConfig()
  const nav = usePageNav(config.pages.length)
  useKeyboardPageNav(nav)

  const { mode } = useUIMode()
  // Kiosk mode is when the display actually needs to stay awake; edit mode
  // happens with someone actively present/touching the screen anyway.
  useWakeLock(mode === 'kiosk')

  const [isManagerOpen, setManagerOpen] = useState(false)
  const [isAddressSetupOpen, setAddressSetupOpen] = useState(false)

  // First-run guided setup (task 5.5): auto-open the address search once per
  // dashboard that has no coords yet, but don't nag again after it's been
  // dismissed/skipped for this dashboard in this session.
  const [autoPromptedForId, setAutoPromptedForId] = useState<string | null>(
    null,
  )
  if (config.coords === null && autoPromptedForId !== config.id) {
    setAutoPromptedForId(config.id)
    if (!isAddressSetupOpen) setAddressSetupOpen(true)
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-surface-base text-surface-text">
      <TopBar
        dashboardName={config.name}
        address={config.address}
        onOpenDashboards={() => setManagerOpen(true)}
        onOpenAddressSetup={() => setAddressSetupOpen(true)}
      />
      <PageDeck
        currentPage={nav.currentPage}
        pageCount={nav.pageCount}
        onNext={nav.next}
        onPrev={nav.prev}
      >
        {config.pages.map((page, index) => (
          <WidgetGrid key={index} pageIndex={index} widgets={page.widgets} />
        ))}
      </PageDeck>
      <PageIndicator
        pageCount={nav.pageCount}
        currentPage={nav.currentPage}
        onSelect={nav.goToPage}
        isEditMode={mode === 'edit'}
        onAddPage={addPage}
        onRemoveCurrentPage={() => removePage(nav.currentPage)}
      />

      {isManagerOpen && (
        <DashboardManagerModal onClose={() => setManagerOpen(false)} />
      )}
      {isAddressSetupOpen && (
        <AddressSetupModal onClose={() => setAddressSetupOpen(false)} />
      )}
    </div>
  )
}
