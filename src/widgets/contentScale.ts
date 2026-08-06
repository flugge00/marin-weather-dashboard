export const MIN_CONTENT_SCALE = 0.5
export const MAX_CONTENT_SCALE = 1.75
export const DEFAULT_CONTENT_SCALE = 1

/**
 * Reads the per-widget content-scale setting (task 6.1.4), shared by every
 * widget type via the generic part of the settings panel (like `showHeader`
 * in task 6.8).
 */
export function readContentScale(settings: Record<string, unknown>): number {
  const raw = settings.contentScale
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return DEFAULT_CONTENT_SCALE
  }
  return Math.min(MAX_CONTENT_SCALE, Math.max(MIN_CONTENT_SCALE, raw))
}
