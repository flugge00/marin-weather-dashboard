import { useEffect, useRef, useState } from 'react'
import { geocodeAddress, type GeocodeResult } from '../lib/geocode/nominatim'
import { useDashboardConfig } from '../state/dashboardConfig/context'
import { useLocale } from '../state/locale/context'

const SEARCH_DEBOUNCE_MS = 500

interface AddressSetupModalProps {
  onClose: () => void
}

/**
 * Guided address entry (tasks 5.5/5.6): a Nominatim-backed search used both
 * for a brand-new dashboard's first-run setup (no coords yet) and for
 * changing an existing dashboard's address later from the header. Every
 * location-dependent widget just renders `MissingAddressNotice` until this
 * has run once (see [[phase4_widgets_status]]).
 */
export function AddressSetupModal({ onClose }: AddressSetupModalProps) {
  const { config, setAddress } = useDashboardConfig()
  const { t } = useLocale()
  const isFirstRun = config.coords === null

  const [query, setQuery] = useState(config.address)
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!trimmed) return

    const controller = new AbortController()
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      geocodeAddress(trimmed, { signal: controller.signal })
        .then((found) => {
          setResults(found)
          setHasSearched(true)
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setError(t('addressSetup.searchError'))
        })
        .finally(() => setLoading(false))
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      controller.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, t])

  const handleSelect = (result: GeocodeResult) => {
    setAddress(result.displayName, { lat: result.lat, lon: result.lon })
    onClose()
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="modal-fade-in flex max-h-[80%] w-[26rem] flex-col rounded-2xl border border-surface-border bg-surface-raised p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-1 text-base font-semibold">
          {isFirstRun
            ? t('addressSetup.titleFirstRun')
            : t('addressSetup.titleChange')}
        </h2>
        <p className="mb-4 text-xs text-surface-muted">
          {isFirstRun
            ? t('addressSetup.descriptionFirstRun')
            : t('addressSetup.descriptionChange')}
        </p>

        <input
          type="text"
          autoFocus
          value={query}
          onChange={(event) => {
            const value = event.target.value
            setQuery(value)
            if (!value.trim()) {
              setResults([])
              setError(null)
              setHasSearched(false)
            }
          }}
          placeholder={t('addressSetup.placeholder')}
          className="mb-3 rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-surface-text"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && (
            <p className="px-1 py-2 text-sm text-surface-muted">
              {t('addressSetup.searching')}
            </p>
          )}
          {error && (
            <p className="px-1 py-2 text-sm text-[color:var(--color-status-error)]">
              {error}
            </p>
          )}
          {!loading && !error && hasSearched && results.length === 0 && (
            <p className="px-1 py-2 text-sm text-surface-muted">
              {t('addressSetup.noMatches')}
            </p>
          )}

          {!loading && results.length > 0 && (
            <ul className="space-y-1">
              {results.map((result, index) => (
                <li key={`${result.lat},${result.lon},${index}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-surface-text hover:bg-surface-hover"
                  >
                    {result.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 self-end rounded-lg px-3 py-1.5 text-sm text-surface-muted hover:text-surface-text"
        >
          {isFirstRun ? t('addressSetup.skipForNow') : t('addressSetup.cancel')}
        </button>
      </div>
    </div>
  )
}
