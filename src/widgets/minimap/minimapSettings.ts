import { VESSEL_CATEGORIES, type VesselCategory } from '../../lib/ais/shipType'

export const MIN_PIN_SIZE_PX = 18
export const MAX_PIN_SIZE_PX = 44
const DEFAULT_PIN_SIZE_PX = 28

export const MIN_BOAT_TRAFFIC_RADIUS_KM = 1
export const MAX_BOAT_TRAFFIC_RADIUS_KM = 500
const DEFAULT_BOAT_TRAFFIC_RADIUS_KM = 5

export const MIN_VESSEL_ICON_SIZE_PX = 10
export const MAX_VESSEL_ICON_SIZE_PX = 28
const DEFAULT_VESSEL_ICON_SIZE_PX = 16

export interface MinimapSettings {
  showStationPin: boolean
  pinSizePx: number
  /** Boat traffic (Phase 8) is opt-in: it needs a device-level AIS API key to do anything. */
  showBoatTraffic: boolean
  /** Radius (km) around the address defining the bounding box we subscribe/display within. */
  boatTrafficRadiusKm: number
  /** Draws a circle on the map showing the boat-traffic radius (toggleable). */
  showBoatTrafficRadiusCircle: boolean
  /** Which vessel categories to display; all categories shown if empty/absent. */
  vesselCategories: VesselCategory[]
  vesselIconSizePx: number
}

export const DEFAULT_MINIMAP_SETTINGS: Record<string, unknown> = {
  showStationPin: true,
  pinSizePx: DEFAULT_PIN_SIZE_PX,
  showBoatTraffic: false,
  boatTrafficRadiusKm: DEFAULT_BOAT_TRAFFIC_RADIUS_KM,
  showBoatTrafficRadiusCircle: true,
  vesselCategories: VESSEL_CATEGORIES,
  vesselIconSizePx: DEFAULT_VESSEL_ICON_SIZE_PX,
}

export function readMinimapSettings(
  settings: Record<string, unknown>,
): MinimapSettings {
  const rawSize = settings.pinSizePx
  const pinSizePx =
    typeof rawSize === 'number' && Number.isFinite(rawSize)
      ? Math.min(MAX_PIN_SIZE_PX, Math.max(MIN_PIN_SIZE_PX, rawSize))
      : DEFAULT_PIN_SIZE_PX

  const rawRadius = settings.boatTrafficRadiusKm
  const boatTrafficRadiusKm =
    typeof rawRadius === 'number' && Number.isFinite(rawRadius)
      ? Math.min(
          MAX_BOAT_TRAFFIC_RADIUS_KM,
          Math.max(MIN_BOAT_TRAFFIC_RADIUS_KM, rawRadius),
        )
      : DEFAULT_BOAT_TRAFFIC_RADIUS_KM

  const rawVesselIconSize = settings.vesselIconSizePx
  const vesselIconSizePx =
    typeof rawVesselIconSize === 'number' && Number.isFinite(rawVesselIconSize)
      ? Math.min(
          MAX_VESSEL_ICON_SIZE_PX,
          Math.max(MIN_VESSEL_ICON_SIZE_PX, rawVesselIconSize),
        )
      : DEFAULT_VESSEL_ICON_SIZE_PX

  const rawCategories = settings.vesselCategories
  const vesselCategories =
    Array.isArray(rawCategories) &&
    rawCategories.every((c) => VESSEL_CATEGORIES.includes(c as VesselCategory))
      ? (rawCategories as VesselCategory[])
      : VESSEL_CATEGORIES

  return {
    showStationPin: settings.showStationPin !== false,
    pinSizePx,
    showBoatTraffic: settings.showBoatTraffic === true,
    boatTrafficRadiusKm,
    showBoatTrafficRadiusCircle: settings.showBoatTrafficRadiusCircle !== false,
    vesselCategories,
    vesselIconSizePx,
  }
}

export interface MinimapView {
  lat: number
  lon: number
  zoom: number
}

/**
 * The saved view is tagged with the address it was taken for (task 6.1.9),
 * so a stale view from a previous address never gets applied to a new one -
 * the minimap already resets on address change (task 6.1.2) by recreating
 * the whole Leaflet map, and this keeps that guarantee even across a page
 * reload, where the widget has no other way to know "the address changed
 * since this view was saved".
 */
interface StoredMinimapView extends MinimapView {
  addressLat: number
  addressLon: number
}

/** Reads the persisted pan/zoom, if any, and only if it still matches `coords`. */
export function readStoredMapView(
  settings: Record<string, unknown>,
  coords: { lat: number; lon: number },
): MinimapView | null {
  const raw = settings.mapView
  if (!raw || typeof raw !== 'object') return null
  const view = raw as Partial<StoredMinimapView>

  if (
    typeof view.lat !== 'number' ||
    typeof view.lon !== 'number' ||
    typeof view.zoom !== 'number' ||
    view.addressLat !== coords.lat ||
    view.addressLon !== coords.lon
  ) {
    return null
  }

  return { lat: view.lat, lon: view.lon, zoom: view.zoom }
}

/** Merges a freshly-observed pan/zoom into `settings`, tagged to `coords`. */
export function withStoredMapView(
  settings: Record<string, unknown>,
  coords: { lat: number; lon: number },
  view: MinimapView,
): Record<string, unknown> {
  const stored: StoredMinimapView = {
    ...view,
    addressLat: coords.lat,
    addressLon: coords.lon,
  }
  return { ...settings, mapView: stored }
}

/** Strips any saved view, e.g. when the user hits "reset view" (task 6.1.3). */
export function withoutStoredMapView(
  settings: Record<string, unknown>,
): Record<string, unknown> {
  const rest = { ...settings }
  delete rest.mapView
  return rest
}
