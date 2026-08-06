import type {
  Forecast,
  ForecastPoint,
  SmhiRawForecastResponse,
  SmhiRawTimeSeriesEntry,
} from './types'

const FORECAST_BASE_URL =
  'https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point'

/**
 * SMHI's `pmp3g` forecast API was deprecated 2026-03-31 and replaced by `snow1g`.
 * See docs/phase1-cors-spike.md for the CORS check and response-shape notes.
 */
function buildForecastUrl(lat: number, lon: number): string {
  const roundedLat = lat.toFixed(6)
  const roundedLon = lon.toFixed(6)
  return `${FORECAST_BASE_URL}/lon/${roundedLon}/lat/${roundedLat}/data.json`
}

function parseTimeSeriesEntry(entry: SmhiRawTimeSeriesEntry): ForecastPoint {
  const { data } = entry
  return {
    time: new Date(entry.time),
    temperatureC: data.air_temperature ?? null,
    windSpeedMs: data.wind_speed ?? null,
    windGustMs: data.wind_speed_of_gust ?? null,
    windDirectionDeg: data.wind_from_direction ?? null,
    humidityPct: data.relative_humidity ?? null,
    cloudCoverPct: data.cloud_area_fraction ?? null,
    precipitationMm: data.precipitation_amount_mean ?? null,
    precipitationProbabilityPct: data.probability_of_precipitation ?? null,
    symbolCode: data.symbol_code ?? null,
  }
}

export async function fetchForecast(
  lat: number,
  lon: number,
  init?: { signal?: AbortSignal },
): Promise<Forecast> {
  const response = await fetch(buildForecastUrl(lat, lon), {
    signal: init?.signal,
  })

  if (!response.ok) {
    throw new Error(
      `SMHI forecast request failed: ${response.status} ${response.statusText}`,
    )
  }

  const raw = (await response.json()) as SmhiRawForecastResponse

  return {
    gridPoint: {
      lon: raw.geometry.coordinates[0],
      lat: raw.geometry.coordinates[1],
    },
    referenceTime: new Date(raw.referenceTime),
    points: raw.timeSeries.map(parseTimeSeriesEntry),
  }
}

/** Convenience accessor: the first (nearest-in-time) forecast point. */
export function getCurrentConditions(forecast: Forecast): ForecastPoint | null {
  return forecast.points[0] ?? null
}
