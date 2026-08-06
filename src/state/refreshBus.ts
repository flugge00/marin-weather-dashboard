type Listener = () => void

const listeners = new Set<Listener>()

/**
 * Minimal pub/sub so `useDataSource` instances (one per widget) can all be
 * told "refresh now" from a single hamburger-menu button (task 6.9) without
 * threading a prop through every widget/registry entry.
 */
export function subscribeToGlobalRefresh(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function triggerGlobalRefresh(): void {
  for (const listener of listeners) listener()
}
