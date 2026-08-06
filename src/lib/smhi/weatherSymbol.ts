/**
 * SMHI's standard weather-symbol scale (historically "Wsymb2"), 1-27.
 * The `snow1g` forecast API still reports it as `symbol_code`.
 * https://opendata.smhi.se/apidocs/metfcst/parameters.html
 */
export type WeatherSymbolCode =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27

export interface WeatherCondition {
  code: WeatherSymbolCode
  /** English fallback description; use `weatherSymbolKey(code)` + `t()` for a translated one. */
  description: string
  /** Coarse bucket, useful for picking an icon before a full icon set exists. */
  category:
    | 'clear'
    | 'partly-cloudy'
    | 'cloudy'
    | 'fog'
    | 'rain'
    | 'sleet'
    | 'snow'
    | 'thunder'
}

const WEATHER_SYMBOLS: Record<WeatherSymbolCode, WeatherCondition> = {
  1: { code: 1, description: 'Clear sky', category: 'clear' },
  2: { code: 2, description: 'Nearly clear sky', category: 'clear' },
  3: { code: 3, description: 'Variable cloudiness', category: 'partly-cloudy' },
  4: { code: 4, description: 'Halfclear sky', category: 'partly-cloudy' },
  5: { code: 5, description: 'Cloudy sky', category: 'cloudy' },
  6: { code: 6, description: 'Overcast', category: 'cloudy' },
  7: { code: 7, description: 'Fog', category: 'fog' },
  8: { code: 8, description: 'Light rain showers', category: 'rain' },
  9: { code: 9, description: 'Moderate rain showers', category: 'rain' },
  10: { code: 10, description: 'Heavy rain showers', category: 'rain' },
  11: { code: 11, description: 'Thunderstorm', category: 'thunder' },
  12: { code: 12, description: 'Light sleet showers', category: 'sleet' },
  13: { code: 13, description: 'Moderate sleet showers', category: 'sleet' },
  14: { code: 14, description: 'Heavy sleet showers', category: 'sleet' },
  15: { code: 15, description: 'Light snow showers', category: 'snow' },
  16: { code: 16, description: 'Moderate snow showers', category: 'snow' },
  17: { code: 17, description: 'Heavy snow showers', category: 'snow' },
  18: { code: 18, description: 'Light rain', category: 'rain' },
  19: { code: 19, description: 'Moderate rain', category: 'rain' },
  20: { code: 20, description: 'Heavy rain', category: 'rain' },
  21: { code: 21, description: 'Thunder', category: 'thunder' },
  22: { code: 22, description: 'Light sleet', category: 'sleet' },
  23: { code: 23, description: 'Moderate sleet', category: 'sleet' },
  24: { code: 24, description: 'Heavy sleet', category: 'sleet' },
  25: { code: 25, description: 'Light snowfall', category: 'snow' },
  26: { code: 26, description: 'Moderate snowfall', category: 'snow' },
  27: { code: 27, description: 'Heavy snowfall', category: 'snow' },
}

export function describeWeatherSymbol(code: number): WeatherCondition {
  const condition = WEATHER_SYMBOLS[code as WeatherSymbolCode]
  if (!condition) {
    throw new Error(`Unknown SMHI weather symbol code: ${code}`)
  }
  return condition
}
