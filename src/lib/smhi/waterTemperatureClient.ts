import { findNearest, type LatLon } from '../geo/distance'

/**
 * All-active-stations feed for parameter 5 (Havstemperatur / water temperature).
 * Per-station endpoints 404 for most stations (many only expose
 * `corrected-archive`, not `latest-hour`); this single feed reliably has
 * everyone that's currently reporting. See docs/phase1-cors-spike.md.
 *
 * Uses the `latest-day` period rather than `latest-hour`: most coastal
 * stations (e.g. ARKÖ) only ever report on a `latest-day`/`corrected-archive`
 * cadence and never appear in `latest-hour` at all, which otherwise only
 * surfaces a handful of offshore buoys nationwide and can leave a station
 * 100km+ away looking "nearest" when a much closer one exists.
 */
const WATER_TEMPERATURE_URL =
  'https://opendata-download-ocobs.smhi.se/api/version/1.0/parameter/5/station-set/all/period/latest-day/data.json'

interface OcobsRawReading {
  date: number
  value: number
  quality: string
  depth: string
}

interface OcobsRawStation {
  key: string
  name: string
  owner: string
  latitude: number
  longitude: number
  value: OcobsRawReading[]
}

interface OcobsRawResponse {
  station: OcobsRawStation[]
}

export interface WaterTemperatureStation extends LatLon {
  id: string
  name: string
  owner: string
}

export interface WaterTemperatureReading {
  station: WaterTemperatureStation
  distanceKm: number
  temperatureC: number
  observedAt: Date
  depthM: number
}

/**
 * Picks the most recent, shallowest reading for a station (depth "0" when
 * present). The `latest-day` feed returns many readings per station (one per
 * hour, usually all at the same depth), so ties on depth must be broken by
 * recency rather than by array order.
 */
function shallowestReading(
  readings: OcobsRawReading[],
): OcobsRawReading | null {
  if (readings.length === 0) return null
  return readings.reduce((best, reading) => {
    if (Number(reading.depth) < Number(best.depth)) return reading
    if (Number(reading.depth) > Number(best.depth)) return best
    return reading.date > best.date ? reading : best
  })
}

export async function fetchNearestWaterTemperature(
  origin: LatLon,
  init?: { signal?: AbortSignal },
): Promise<WaterTemperatureReading | null> {
  const response = await fetch(WATER_TEMPERATURE_URL, { signal: init?.signal })

  if (!response.ok) {
    throw new Error(
      `SMHI ocobs request failed: ${response.status} ${response.statusText}`,
    )
  }

  const raw = (await response.json()) as OcobsRawResponse

  const candidates = raw.station
    .map((station) => {
      const reading = shallowestReading(station.value)
      if (!reading) return null
      return {
        id: station.key,
        name: station.name,
        owner: station.owner,
        lat: station.latitude,
        lon: station.longitude,
        reading,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  const nearest = findNearest(origin, candidates)
  if (!nearest) return null

  return {
    station: {
      id: nearest.id,
      name: nearest.name,
      owner: nearest.owner,
      lat: nearest.lat,
      lon: nearest.lon,
    },
    distanceKm: nearest.distanceKm,
    temperatureC: nearest.reading.value,
    observedAt: new Date(nearest.reading.date),
    depthM: Number(nearest.reading.depth),
  }
}
