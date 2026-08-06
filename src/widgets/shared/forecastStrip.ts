import type { ForecastPoint } from '../../lib/smhi/types'

export const MAX_STRIP_ITEMS = 8

/**
 * Downsamples a forecast's points to a fixed-size strip within `rangeHours`,
 * shared by the forecast strip (task 4.5) and the rain-risk graph (task
 * 6.1.8) so both stay capped to a size that never needs scrolling.
 */
export function selectStripPoints(
  points: ForecastPoint[],
  rangeHours: number,
  maxItems: number = MAX_STRIP_ITEMS,
): ForecastPoint[] {
  const cutoff = Date.now() + rangeHours * 60 * 60 * 1000
  const inRange = points.filter((point) => point.time.getTime() <= cutoff)
  if (inRange.length <= maxItems) return inRange

  const step = Math.ceil(inRange.length / maxItems)
  return inRange.filter((_, index) => index % step === 0).slice(0, maxItems)
}
