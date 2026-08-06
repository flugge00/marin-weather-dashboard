import type { LatLon } from '../geo/distance'

const KM_PER_DEGREE_LAT = 111

/**
 * A small square-ish box around `center`, `radiusKm` in every direction.
 * Good enough for a "how far around my address do I care about boat
 * traffic" filter - doesn't need to be geodesically exact, just small and
 * adjustable (we can't reliably fetch/show *all* AIS traffic, see PLAN.md
 * Phase 8).
 */
export function boundingBoxAroundKm(
  center: LatLon,
  radiusKm: number,
): [[number, number], [number, number]] {
  const dLat = radiusKm / KM_PER_DEGREE_LAT
  const kmPerDegreeLon =
    KM_PER_DEGREE_LAT * Math.cos((center.lat * Math.PI) / 180)
  const dLon = radiusKm / Math.max(kmPerDegreeLon, 1)

  return [
    [center.lat - dLat, center.lon - dLon],
    [center.lat + dLat, center.lon + dLon],
  ]
}
