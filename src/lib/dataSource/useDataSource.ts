import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeToGlobalRefresh } from '../../state/refreshBus'
import type { DataSourceState } from './types'

export interface UseDataSourceOptions {
  /** Poll interval in ms. Defaults to 60s. Pass `null` to disable polling. */
  intervalMs?: number | null
  /**
   * How long a successful sync stays `ok` before being downgraded to `stale`
   * (data is kept, but a widget should signal it's no longer fresh).
   * Defaults to 2x `intervalMs`.
   */
  staleAfterMs?: number
}

export interface UseDataSourceResult<T> extends DataSourceState<T> {
  /** Force an immediate fetch, independent of the poll interval. */
  refresh: () => void
}

export const DEFAULT_POLL_INTERVAL_MS = 60_000
const STALE_CHECK_INTERVAL_MS = 30_000

/**
 * Generic status-tracking + polling wrapper around a fetch function, meant
 * to be shared by every widget's data hook (SMHI forecast, water
 * temperature, etc). Tracks loading/error/staleness so widgets only need to
 * render a status dot + timestamp, not reimplement sync bookkeeping.
 */
export function useDataSource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: UseDataSourceOptions = {},
): UseDataSourceResult<T> {
  const intervalMs =
    options.intervalMs === undefined
      ? DEFAULT_POLL_INTERVAL_MS
      : options.intervalMs
  const staleAfterMs =
    options.staleAfterMs ?? (intervalMs ?? DEFAULT_POLL_INTERVAL_MS) * 2

  const [state, setState] = useState<DataSourceState<T>>({
    data: null,
    status: 'stale',
    loading: false,
    lastSyncedAt: null,
    lastError: null,
  })

  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const requestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const runFetch = useCallback(async () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const requestId = ++requestIdRef.current
    setState((prev) => ({ ...prev, loading: true }))

    try {
      const data = await fetcherRef.current(controller.signal)
      if (requestId !== requestIdRef.current) return
      setState({
        data,
        status: 'ok',
        loading: false,
        lastSyncedAt: Date.now(),
        lastError: null,
      })
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      const message = error instanceof Error ? error.message : String(error)
      setState((prev) => ({
        ...prev,
        status: prev.data === null ? 'error' : 'stale',
        loading: false,
        lastError: message,
      }))
    }
  }, [])

  const refresh = useCallback(() => {
    void runFetch()
  }, [runFetch])

  useEffect(() => {
    // Fetching on mount is the standard use of an Effect; the synchronous
    // `loading: true` setState inside runFetch is intentional (it only runs
    // once here, not on every render) so we suppress the compiler-safety
    // lint rule rather than restructure a correct, one-shot fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runFetch()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [runFetch])

  useEffect(() => {
    if (!intervalMs) return
    const id = setInterval(() => void runFetch(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, runFetch])

  // Every data source listens for the global "refresh all" trigger (task 6.9)
  // so a single hamburger-menu button can force every widget to re-sync.
  useEffect(() => subscribeToGlobalRefresh(() => void runFetch()), [runFetch])

  // Downgrade to `stale` purely on data age, even if no fetch has failed -
  // e.g. a long-idle tab that missed poll ticks.
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.status !== 'ok' || prev.lastSyncedAt === null) return prev
        if (Date.now() - prev.lastSyncedAt < staleAfterMs) return prev
        return { ...prev, status: 'stale' }
      })
    }, STALE_CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [staleAfterMs])

  return { ...state, refresh }
}
