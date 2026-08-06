/** Raw shapes as returned by the SMHI `snow1g` point-forecast API. */
export interface SmhiRawForecastResponse {
  createdTime: string
  referenceTime: string
  geometry: {
    type: 'Point'
    coordinates: [lon: number, lat: number]
  }
  timeSeries: SmhiRawTimeSeriesEntry[]
}

export interface SmhiRawTimeSeriesEntry {
  time: string
  data: {
    air_temperature?: number
    wind_from_direction?: number
    wind_speed?: number
    wind_speed_of_gust?: number
    relative_humidity?: number
    air_pressure_at_mean_sea_level?: number
    visibility_in_air?: number
    thunderstorm_probability?: number
    cloud_area_fraction?: number
    precipitation_amount_mean?: number
    probability_of_precipitation?: number
    symbol_code?: number
    [parameter: string]: number | undefined
  }
}

/** Clean internal shape used by widgets, independent of SMHI's field names. */
export interface ForecastPoint {
  time: Date
  temperatureC: number | null
  windSpeedMs: number | null
  windGustMs: number | null
  windDirectionDeg: number | null
  humidityPct: number | null
  cloudCoverPct: number | null
  precipitationMm: number | null
  precipitationProbabilityPct: number | null
  symbolCode: number | null
}

export interface Forecast {
  /** Where the forecast grid point actually is (SMHI snaps to its nearest grid cell). */
  gridPoint: { lat: number; lon: number }
  referenceTime: Date
  points: ForecastPoint[]
}
