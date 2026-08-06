export interface LatLon {
  lat: number
  lon: number
}

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Great-circle distance between two points, in kilometers. */
export function haversineDistanceKm(a: LatLon, b: LatLon): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Returns the item in `points` nearest to `origin`, or null if `points` is empty. */
export function findNearest<T extends LatLon>(
  origin: LatLon,
  points: readonly T[],
): (T & { distanceKm: number }) | null {
  let nearest: (T & { distanceKm: number }) | null = null

  for (const point of points) {
    const distanceKm = haversineDistanceKm(origin, point)
    if (nearest === null || distanceKm < nearest.distanceKm) {
      nearest = { ...point, distanceKm }
    }
  }

  return nearest
}
