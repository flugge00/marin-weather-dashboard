import { findNearest, type LatLon } from '../geo/distance'

export interface OcobsStation extends LatLon {
  id: string
  name: string
  owner: string
}

export interface OcobsReading {
  date: number
  value: number
}

export interface OcobsStationSeries {
  station: OcobsStation
  distanceKm: number
  /** Ascending by time. */
  readings: OcobsReading[]
}

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

type OcobsPeriod = 'latest-hour' | 'latest-day'

function ocobsAllStationsUrl(parameterId: number, period: OcobsPeriod): string {
  return `https://opendata-download-ocobs.smhi.se/api/version/1.0/parameter/${parameterId}/station-set/all/period/${period}/data.json`
}

function ocobsStationUrl(
  parameterId: number,
  stationKey: string,
  period: OcobsPeriod,
): string {
  return `https://opendata-download-ocobs.smhi.se/api/version/1.0/parameter/${parameterId}/station/${stationKey}/period/${period}/data.json`
}

/**
 * Shared "all active stations in one file" ocobs pattern (see
 * waterTemperatureClient.ts, which pioneered this for water temperature -
 * per-station endpoints 404 for most stations, but the bulk feed reliably
 * has everyone currently reporting). Returns the station nearest `origin`
 * together with its full reading series so callers can read the latest
 * value and/or compute a trend.
 */
export async function fetchNearestOcobsSeries(
  parameterId: number,
  origin: LatLon,
  period: OcobsPeriod,
  init?: { signal?: AbortSignal },
): Promise<OcobsStationSeries | null> {
  const response = await fetch(ocobsAllStationsUrl(parameterId, period), {
    signal: init?.signal,
  })

  if (!response.ok) {
    throw new Error(
      `SMHI ocobs request failed: ${response.status} ${response.statusText}`,
    )
  }

  const raw = (await response.json()) as OcobsRawResponse

  const candidates = raw.station
    .filter((station) => station.value.length > 0)
    .map((station) => ({
      id: station.key,
      name: station.name,
      owner: station.owner,
      lat: station.latitude,
      lon: station.longitude,
      readings: [...station.value]
        .sort((a, b) => a.date - b.date)
        .map((reading) => ({ date: reading.date, value: reading.value })),
    }))

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
    readings: nearest.readings,
  }
}

/**
 * Same reading series, but for one already-known station rather than a
 * nearest-station search (e.g. fetching a second parameter, like wave
 * period, for the buoy already picked via wave height).
 */
export async function fetchOcobsStationSeries(
  parameterId: number,
  stationKey: string,
  period: OcobsPeriod,
  init?: { signal?: AbortSignal },
): Promise<OcobsReading[]> {
  const response = await fetch(
    ocobsStationUrl(parameterId, stationKey, period),
    { signal: init?.signal },
  )

  if (!response.ok) {
    if (response.status === 404) return []
    throw new Error(
      `SMHI ocobs request failed: ${response.status} ${response.statusText}`,
    )
  }

  const raw = (await response.json()) as { value: OcobsRawReading[] }
  return [...raw.value]
    .sort((a, b) => a.date - b.date)
    .map((reading) => ({ date: reading.date, value: reading.value }))
}
