const COMPASS_POINTS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
]

/** Converts a compass bearing in degrees to a short direction label (e.g. "NE"). */
export function degreesToCompass(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.round(normalized / 22.5) % COMPASS_POINTS.length
  return COMPASS_POINTS[index]
}
