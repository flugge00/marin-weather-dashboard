import type { LatLon } from '../geo/distance'
import { fetchNearestOcobsSeries, type OcobsStation } from './ocobsClient'

/**
 * Ocobs parameter 6, "Havsvattenstånd" - hourly sea level in cm, already
 * signed relative to each station's own theoretical/normal zero level (not
 * an absolute depth) - readings across the network currently range from
 * about -10 to +46 cm, confirming negative values do occur.
 */
const SEA_LEVEL_PARAMETER = 6

/** Readings are hourly; comparing against 3 steps back gives a 3h trend. */
const TREND_LOOKBACK_STEPS = 3

export interface SeaLevelReading {
  station: OcobsStation
  distanceKm: number
  levelCm: number
  /** cm/hour over the last few readings, or null if there isn't enough history yet. */
  trendCmPerHour: number | null
  observedAt: Date
}

export async function fetchNearestSeaLevel(
  origin: LatLon,
  init?: { signal?: AbortSignal },
): Promise<SeaLevelReading | null> {
  const series = await fetchNearestOcobsSeries(
    SEA_LEVEL_PARAMETER,
    origin,
    'latest-day',
    init,
  )
  if (!series || series.readings.length === 0) return null

  const { readings } = series
  const latest = readings[readings.length - 1]
  const past = readings[readings.length - 1 - TREND_LOOKBACK_STEPS] ?? null
  const trendCmPerHour = past
    ? (latest.value - past.value) / ((latest.date - past.date) / 3_600_000)
    : null

  return {
    station: series.station,
    distanceKm: series.distanceKm,
    levelCm: latest.value,
    trendCmPerHour,
    observedAt: new Date(latest.date),
  }
}
