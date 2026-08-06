import type { LatLon } from '../geo/distance'
import {
  fetchNearestOcobsSeries,
  fetchOcobsStationSeries,
  type OcobsStation,
} from './ocobsClient'

/** Ocobs parameters: 1 = significant wave height (m), 10 = mean wave period (s). Buoy network only, ~5 stations nationwide. */
const WAVE_HEIGHT_PARAMETER = 1
const WAVE_PERIOD_PARAMETER = 10

export interface WaveReading {
  station: OcobsStation
  distanceKm: number
  heightM: number
  /** null if this buoy doesn't also report period, or the request for it failed. */
  periodS: number | null
  observedAt: Date
}

export async function fetchNearestWave(
  origin: LatLon,
  init?: { signal?: AbortSignal },
): Promise<WaveReading | null> {
  const heightSeries = await fetchNearestOcobsSeries(
    WAVE_HEIGHT_PARAMETER,
    origin,
    'latest-day',
    init,
  )
  if (!heightSeries || heightSeries.readings.length === 0) return null

  const latestHeight = heightSeries.readings[heightSeries.readings.length - 1]

  const periodReadings = await fetchOcobsStationSeries(
    WAVE_PERIOD_PARAMETER,
    heightSeries.station.id,
    'latest-day',
    init,
  )
  const latestPeriod = periodReadings[periodReadings.length - 1] ?? null

  return {
    station: heightSeries.station,
    distanceKm: heightSeries.distanceKm,
    heightM: latestHeight.value,
    periodS: latestPeriod?.value ?? null,
    observedAt: new Date(latestHeight.date),
  }
}
