const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

export interface GeocodeResult {
  displayName: string
  lat: number
  lon: number
}

interface NominatimRawResult {
  display_name: string
  lat: string
  lon: string
}

/**
 * One-time address -> coordinates lookup (dashboard setup step), not called
 * on a poll loop. Nominatim's usage policy requires an identifying
 * User-Agent/Referer and caps free use at ~1 req/sec — both satisfied by
 * this being a manual, occasional lookup. See docs/phase1-cors-spike.md.
 */
export async function geocodeAddress(
  query: string,
  init?: { signal?: AbortSignal; limit?: number },
): Promise<GeocodeResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const url = new URL(NOMINATIM_SEARCH_URL)
  url.searchParams.set('q', trimmed)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', String(init?.limit ?? 5))

  const response = await fetch(url, {
    signal: init?.signal,
    headers: {
      'Accept-Language': 'en',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Nominatim geocoding request failed: ${response.status} ${response.statusText}`,
    )
  }

  const raw = (await response.json()) as NominatimRawResult[]

  return raw.map((result) => ({
    displayName: result.display_name,
    lat: Number(result.lat),
    lon: Number(result.lon),
  }))
}
