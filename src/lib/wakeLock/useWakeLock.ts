import { useEffect, useRef, useState } from 'react'

export type WakeLockStatus = 'unsupported' | 'inactive' | 'active' | 'denied'

/**
 * Keeps the screen awake in kiosk mode via the Wake Lock API. Support is
 * inconsistent on iPadOS Safari (varies by version and PWA-vs-browser
 * context), so this is a best-effort layer - the reliable fallback is
 * disabling Auto-Lock or pinning the page with Guided Access on the device
 * itself; see docs/phase2-kiosk-mode.md.
 */
export function useWakeLock(enabled: boolean): WakeLockStatus {
  const [status, setStatus] = useState<WakeLockStatus>(() =>
    'wakeLock' in navigator ? 'inactive' : 'unsupported',
  )
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!('wakeLock' in navigator) || !enabled) return

    let cancelled = false

    const release = () => {
      sentinelRef.current?.release().catch(() => {})
      sentinelRef.current = null
    }

    const acquire = async () => {
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void sentinel.release()
          return
        }
        sentinelRef.current = sentinel
        setStatus('active')
        sentinel.addEventListener('release', () => {
          if (!cancelled) setStatus('inactive')
        })
      } catch {
        if (!cancelled) setStatus('denied')
      }
    }

    void acquire()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinelRef.current) {
        void acquire()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      release()
    }
  }, [enabled])

  return status
}
