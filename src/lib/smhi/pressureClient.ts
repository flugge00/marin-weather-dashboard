import { findNearest, type LatLon } from '../geo/distance'

/**
 * Metobs parameter 9, "Lufttryck reducerat havsytans nivå" (sea-level
 * pressure, hPa). Unlike ocobs, metobs's bulk "all stations" feed only ever
 * exposes the latest hour (its own title says so: "...för senaste timmen i
 * en fil") - `latest-day` 404s at the station-set/all level. A trend needs a
 * second, per-station `latest-day` fetch once the nearest station is known.
 */
const PRESSURE_PARAMETER = 9

/** Readings are hourly; comparing against 3 steps back gives a 3h trend. */
const TREND_LOOKBACK_STEPS = 3

interface MetobsRawReading {
  date: number
  value: string
  quality: string
}

interface MetobsRawStation {
  key: string
  name: string
  owner: string
  latitude: number
  longitude: number
  value: MetobsRawReading[]
}

interface MetobsRawResponse {
  station: MetobsRawStation[]
}

export interface PressureStation extends LatLon {
  id: string
  name: string
  owner: string
}

export interface PressureReading {
  station: PressureStation
  distanceKm: number
  hPa: number
  /** hPa/3h, or null if the secondary trend fetch didn't have enough history. */
  trendHPaPer3h: number | null
  observedAt: Date
}

function allStationsUrl(): string {
  return `https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${PRESSURE_PARAMETER}/station-set/all/period/latest-hour/data.json`
}

function stationLatestDayUrl(stationKey: string): string {
  return `https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${PRESSURE_PARAMETER}/station/${stationKey}/period/latest-day/data.json`
}

async function fetchTrend(
  stationKey: string,
  init?: { signal?: AbortSignal },
): Promise<number | null> {
  try {
    const response = await fetch(stationLatestDayUrl(stationKey), {
      signal: init?.signal,
    })
    if (!response.ok) return null

    const raw = (await response.json()) as { value: MetobsRawReading[] }
    const readings = [...raw.value]
      .sort((a, b) => a.date - b.date)
      .map((reading) => ({ date: reading.date, value: Number(reading.value) }))

    const latest = readings[readings.length - 1]
    const past = readings[readings.length - 1 - TREND_LOOKBACK_STEPS]
    if (!latest || !past) return null

    const hoursApart = (latest.date - past.date) / 3_600_000
    return ((latest.value - past.value) / hoursApart) * 3
  } catch {
    // Trend is a nice-to-have on top of the current reading; a failed
    // secondary fetch shouldn't fail the whole widget.
    return null
  }
}

export async function fetchNearestPressure(
  origin: LatLon,
  init?: { signal?: AbortSignal },
): Promise<PressureReading | null> {
  const response = await fetch(allStationsUrl(), { signal: init?.signal })

  if (!response.ok) {
    throw new Error(
      `SMHI metobs request failed: ${response.status} ${response.statusText}`,
    )
  }

  const raw = (await response.json()) as MetobsRawResponse

  const candidates = raw.station
    .filter((station) => station.value.length > 0)
    .map((station) => ({
      id: station.key,
      name: station.name,
      owner: station.owner,
      lat: station.latitude,
      lon: station.longitude,
      latest: [...station.value].sort((a, b) => b.date - a.date)[0],
    }))

  const nearest = findNearest(origin, candidates)
  if (!nearest) return null

  const trendHPaPer3h = await fetchTrend(nearest.id, init)

  return {
    station: {
      id: nearest.id,
      name: nearest.name,
      owner: nearest.owner,
      lat: nearest.lat,
      lon: nearest.lon,
    },
    distanceKm: nearest.distanceKm,
    hPa: Number(nearest.latest.value),
    trendHPaPer3h,
    observedAt: new Date(nearest.latest.date),
  }
}
