import type { LatLon } from './distance'

type Ring = [lon: number, lat: number][]

export interface GeoJsonGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: Ring[] | Ring[][]
}

/** Standard ray-casting even-odd test. */
function pointInRing(point: LatLon, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const crosses =
      yi > point.lat !== yj > point.lat &&
      point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
    if (crosses) inside = !inside
  }
  return inside
}

/** GeoJSON Polygon coordinates: first ring is the outer boundary, the rest are holes. */
function pointInPolygonRings(point: LatLon, rings: Ring[]): boolean {
  const [outer, ...holes] = rings
  if (!outer || !pointInRing(point, outer)) return false
  return !holes.some((hole) => pointInRing(point, hole))
}

/** Used to filter SMHI warning areas (counties + marine districts) down to whichever contain a dashboard's coords. */
export function pointInGeometry(point: LatLon, geometry: GeoJsonGeometry): boolean {
  if (geometry.type === 'Polygon') {
    return pointInPolygonRings(point, geometry.coordinates as Ring[])
  }
  return (geometry.coordinates as Ring[][]).some((rings) =>
    pointInPolygonRings(point, rings),
  )
}
