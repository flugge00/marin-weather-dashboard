import { createStarterDashboardConfig } from '../../state/dashboardConfig/defaults'
import type {
  DashboardConfig,
  DashboardSummary,
} from '../../state/dashboardConfig/types'
import { readJson, removeJson, writeJson } from './localStorageJson'

const INDEX_KEY = 'marin-dashboard:index'
const ACTIVE_KEY = 'marin-dashboard:active'
const configKey = (id: string) => `marin-dashboard:config:${id}`

function readIndex(): string[] {
  return readJson<string[]>(INDEX_KEY) ?? []
}

function writeIndex(ids: string[]): void {
  writeJson(INDEX_KEY, ids)
}

export function listDashboards(): DashboardSummary[] {
  return readIndex()
    .map((id) => loadDashboard(id))
    .filter((config): config is DashboardConfig => config !== null)
    .map(({ id, name }) => ({ id, name }))
}

export function loadDashboard(id: string): DashboardConfig | null {
  return readJson<DashboardConfig>(configKey(id))
}

export function saveDashboard(config: DashboardConfig): void {
  writeJson(configKey(config.id), config)
  const ids = readIndex()
  if (!ids.includes(config.id)) writeIndex([...ids, config.id])
}

export function deleteDashboard(id: string): void {
  removeJson(configKey(id))
  writeIndex(readIndex().filter((existingId) => existingId !== id))
  if (getActiveDashboardId() === id) removeJson(ACTIVE_KEY)
}

/** Deep-clones the source config under a new id/name so edits to the copy never touch the original. */
export function duplicateDashboard(
  id: string,
  name: string,
): DashboardConfig | null {
  const source = loadDashboard(id)
  if (!source) return null

  const copy: DashboardConfig = {
    ...source,
    id: crypto.randomUUID(),
    name,
    pages: source.pages.map((page) => ({
      widgets: page.widgets.map((widget) => ({
        ...widget,
        layout: { ...widget.layout },
        settings: { ...widget.settings },
      })),
    })),
  }
  saveDashboard(copy)
  return copy
}

export function getActiveDashboardId(): string | null {
  return readJson<string>(ACTIVE_KEY)
}

export function setActiveDashboardId(id: string): void {
  writeJson(ACTIVE_KEY, id)
}

/**
 * Boots dashboard storage: returns the active config, falling back to the
 * first saved dashboard, and finally creating a populated starter dashboard
 * if this device has never had a dashboard configured (first-run).
 */
export function ensureActiveDashboard(): DashboardConfig {
  const activeId = getActiveDashboardId()
  const active = activeId ? loadDashboard(activeId) : null
  if (active) return active

  const [firstSummary] = listDashboards()
  const first = firstSummary ? loadDashboard(firstSummary.id) : null
  if (first) {
    setActiveDashboardId(first.id)
    return first
  }

  const fresh = createStarterDashboardConfig()
  saveDashboard(fresh)
  setActiveDashboardId(fresh.id)
  return fresh
}
