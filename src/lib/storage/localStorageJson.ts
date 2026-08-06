/**
 * Small typed wrapper around localStorage - every dashboard config is stored
 * as a JSON blob (see PLAN.md's persistence choice), so callers shouldn't
 * need to touch JSON.parse/stringify or handle storage errors themselves.
 */
export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeJson(key: string): void {
  window.localStorage.removeItem(key)
}
