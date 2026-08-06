import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef } from 'react'
import { useAisVessels } from '../../lib/ais/aisStreamClient'
import { boundingBoxAroundKm } from '../../lib/ais/boundingBox'
import { categorizeShipType } from '../../lib/ais/shipType'
import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchNearestWaterTemperature } from '../../lib/smhi/waterTemperatureClient'
import { useLocale } from '../../state/locale/context'
import { useUIMode } from '../../state/uiModeContext'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { AisStatusBadge } from './AisStatusBadge'
import {
  readMinimapSettings,
  readStoredMapView,
  withoutStoredMapView,
  withStoredMapView,
} from './minimapSettings'
import { createPinIcon } from './pinIcon'
import { createVesselIcon } from './vesselIcon'
import { buildVesselPopupHtml } from './vesselPopup'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors'
const DEFAULT_ZOOM = 13
const FIT_BOUNDS_PADDING: [number, number] = [24, 24]

/**
 * Preview-only Leaflet map centered on the dashboard's address (task 4.6).
 * Interaction (drag/zoom) is only enabled in edit mode (task 6.1.5) - kiosk
 * mode locks the view so it never gets bumped by accidental taps. The view
 * is only auto-fit once, the first time the water-temperature station pin
 * shows up; subsequent data refreshes just move the pin without resetting
 * whatever pan/zoom the user landed on (task 6.1.2). A "reset view" button
 * (edit mode only, task 6.1.3) re-fits on demand. Address/station pins use
 * distinct glyphs and an adjustable size, and the station pin can be hidden
 * entirely, all via per-widget settings (task 6.1.6). The user's pan/zoom is
 * persisted into the widget's own settings (task 6.1.9) so it survives a
 * full page reload, not just a data refresh - tagged to the address it was
 * taken for so it never gets misapplied after the address changes. Optional
 * live AIS boat-traffic overlay (Phase 8), opt-in via settings since it
 * needs a personal aisstream.io API key (set in the hamburger menu).
 */
export function MinimapWidget({
  settings,
  onSettingsChange,
}: {
  settings: Record<string, unknown>
  onSettingsChange?: (settings: Record<string, unknown>) => void
}) {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs, aisApiKey } = useAppSettings()
  const { isEditMode } = useUIMode()
  const { t } = useLocale()
  const coords = config.coords
  const {
    showStationPin,
    pinSizePx,
    showBoatTraffic,
    boatTrafficRadiusKm,
    showBoatTrafficRadiusCircle,
    vesselCategories,
    vesselIconSizePx,
  } = readMinimapSettings(settings)

  const { data: station } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchNearestWaterTemperature(coords, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  const { vessels, status: aisStatus } = useAisVessels({
    apiKey: aisApiKey,
    center: coords,
    radiusKm: boatTrafficRadiusKm,
    enabled: showBoatTraffic && coords !== null,
  })

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const addressMarkerRef = useRef<L.Marker | null>(null)
  const stationMarkerRef = useRef<L.Marker | null>(null)
  const vesselMarkersRef = useRef<Map<number, L.Marker>>(new Map())
  const radiusCircleRef = useRef<L.Circle | null>(null)
  const hasAutoFitRef = useRef(false)
  // Skips the very first run of the "boat traffic settings changed" refit
  // effect below (mount is already covered by hasAutoFitRef's initial fit);
  // reset to true whenever the map itself is recreated (address change).
  const isFirstBoatTrafficRunRef = useRef(true)
  // True while a view change was triggered by our own code (initial
  // placement, auto-fit, the reset button) rather than the user dragging or
  // zooming - moveend/zoomend still fire either way, so this is how the
  // persistence listener tells the two apart (task 6.1.9).
  const isProgrammaticMoveRef = useRef(false)
  const settingsRef = useRef(settings)
  const onSettingsChangeRef = useRef(onSettingsChange)
  const tRef = useRef(t)
  useEffect(() => {
    settingsRef.current = settings
    onSettingsChangeRef.current = onSettingsChange
    tRef.current = t
  })

  const addressPin = useMemo(
    () => createPinIcon('#2f83fa', 'home', pinSizePx),
    [pinSizePx],
  )
  const stationPin = useMemo(
    () => createPinIcon('#ef4444', 'station', pinSizePx),
    [pinSizePx],
  )

  // Includes the boat-traffic radius (when enabled) in what "fit to markers"
  // means - otherwise vessels near the edge of a large radius exist as real
  // markers but sit far outside a view that's only ever been fit to the
  // tight address+station area, so they're never actually visible.
  const fitToMarkers = () => {
    const map = mapRef.current
    if (!map || !coords) return
    isProgrammaticMoveRef.current = true

    const points: [number, number][] = [[coords.lat, coords.lon]]
    if (station) points.push([station.station.lat, station.station.lon])
    if (showBoatTraffic) {
      const [southWest, northEast] = boundingBoxAroundKm(
        coords,
        boatTrafficRadiusKm,
      )
      points.push(southWest, northEast)
    }

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        padding: FIT_BOUNDS_PADDING,
        maxZoom: DEFAULT_ZOOM,
        animate: false,
      })
    } else {
      map.setView([coords.lat, coords.lon], DEFAULT_ZOOM, { animate: false })
    }
    isProgrammaticMoveRef.current = false
  }

  /** "Reset view" (task 6.1.3): re-fits and forgets whatever was saved. */
  const handleResetView = () => {
    fitToMarkers()
    onSettingsChangeRef.current?.(withoutStoredMapView(settingsRef.current))
  }

  useEffect(() => {
    if (!coords || !containerRef.current) return

    const storedView = readStoredMapView(settingsRef.current, coords)
    hasAutoFitRef.current = storedView !== null
    isFirstBoatTrafficRunRef.current = true

    const map = L.map(containerRef.current, {
      center: storedView
        ? [storedView.lat, storedView.lon]
        : [coords.lat, coords.lon],
      zoom: storedView ? storedView.zoom : DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    })
    mapRef.current = map

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map)

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)

    // Persist the user's own pans/zooms (not ones we triggered ourselves)
    // into the widget's settings, so they survive a page reload.
    const persistView = () => {
      if (isProgrammaticMoveRef.current || !onSettingsChangeRef.current) return
      const center = map.getCenter()
      onSettingsChangeRef.current(
        withStoredMapView(settingsRef.current, coords, {
          lat: center.lat,
          lon: center.lng,
          zoom: map.getZoom(),
        }),
      )
    }
    map.on('moveend', persistView)
    map.on('zoomend', persistView)

    const vesselMarkers = vesselMarkersRef.current
    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      addressMarkerRef.current = null
      stationMarkerRef.current = null
      vesselMarkers.clear()
      radiusCircleRef.current = null
    }
  }, [coords])

  // Gate all interaction handlers + the zoom control on edit mode (task
  // 6.1.5): kiosk mode is a locked glance-only preview, edit mode is a full
  // pannable/zoomable map.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (isEditMode) {
      map.dragging.enable()
      map.touchZoom.enable()
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
      map.zoomControl.remove()
      map.addControl(map.zoomControl)
    } else {
      map.dragging.disable()
      map.touchZoom.disable()
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
      map.zoomControl.remove()
    }
  }, [isEditMode, coords])

  // Address pin: created once per map instance, icon swapped when the
  // configured pin size changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !coords) return

    if (!addressMarkerRef.current) {
      addressMarkerRef.current = L.marker([coords.lat, coords.lon], {
        icon: addressPin,
      }).addTo(map)
    } else {
      addressMarkerRef.current.setIcon(addressPin)
    }
  }, [coords, addressPin])

  // Plots/updates the nearest water-temperature station as a second pin
  // (task 6.7), hideable via settings (task 6.1.6). Only fits the map bounds
  // the first time the station appears - later data refreshes just reposition
  // the pin so a user's manual pan/zoom survives a refresh (task 6.1.2).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !coords) return

    if (!station || !showStationPin) {
      stationMarkerRef.current?.remove()
      stationMarkerRef.current = null
      if (!hasAutoFitRef.current) {
        hasAutoFitRef.current = true
        fitToMarkers()
      }
      return
    }

    if (!stationMarkerRef.current) {
      stationMarkerRef.current = L.marker(
        [station.station.lat, station.station.lon],
        { icon: stationPin },
      ).addTo(map)
    } else {
      stationMarkerRef.current.setLatLng([
        station.station.lat,
        station.station.lon,
      ])
      stationMarkerRef.current.setIcon(stationPin)
    }

    stationMarkerRef.current.bindTooltip(
      `${station.station.name} · ${station.distanceKm.toFixed(1)} km`,
      { direction: 'top', permanent: false },
    )

    if (!hasAutoFitRef.current) {
      hasAutoFitRef.current = true
      fitToMarkers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, station, showStationPin, stationPin])

  // Draws the boat-traffic radius as a circle around the address (Phase 8
  // follow-up), toggleable independent of the traffic itself so it can be
  // used as a one-off visual reference without permanently cluttering the map.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !coords) return

    if (!showBoatTraffic || !showBoatTrafficRadiusCircle) {
      radiusCircleRef.current?.remove()
      radiusCircleRef.current = null
      return
    }

    const radiusMeters = boatTrafficRadiusKm * 1000
    if (!radiusCircleRef.current) {
      radiusCircleRef.current = L.circle([coords.lat, coords.lon], {
        radius: radiusMeters,
        color: '#2f83fa',
        weight: 1.5,
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(map)
    } else {
      radiusCircleRef.current.setLatLng([coords.lat, coords.lon])
      radiusCircleRef.current.setRadius(radiusMeters)
    }
  }, [
    coords,
    showBoatTraffic,
    showBoatTrafficRadiusCircle,
    boatTrafficRadiusKm,
  ])

  // Re-fits the view whenever boat traffic is turned on or its radius is
  // widened via settings - a deliberate edit, unlike the incidental data
  // refreshes fitToMarkers() otherwise ignores (task 6.1.2), so it's fine
  // (expected, even) for it to move the view. Otherwise a bigger radius
  // just means markers piling up outside a view that's still fit to the
  // tight address+station area - real vessels, invisible.
  useEffect(() => {
    if (!mapRef.current || !coords) return
    if (isFirstBoatTrafficRunRef.current) {
      isFirstBoatTrafficRunRef.current = false
      return
    }
    if (showBoatTraffic) fitToMarkers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBoatTraffic, boatTrafficRadiusKm])

  // Plots live AIS vessel positions (Phase 8), filtered to the enabled
  // categories, as small heading-rotated markers - deliberately excluded
  // from fitToMarkers() since they move continuously and shouldn't keep
  // yanking the user's view around. Tap -> popover with vessel stats
  // (task 8.6); markers/popups are updated in place rather than recreated so
  // an open popup's content refreshes live instead of closing.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!showBoatTraffic) {
      for (const marker of vesselMarkersRef.current.values()) marker.remove()
      vesselMarkersRef.current.clear()
      return
    }

    const visibleMmsi = new Set<number>()
    for (const vessel of vessels) {
      const category = categorizeShipType(vessel.shipType)
      if (!vesselCategories.includes(category)) continue
      visibleMmsi.add(vessel.mmsi)

      const icon = createVesselIcon(
        category,
        vessel.headingDeg ?? vessel.courseDeg,
        vesselIconSizePx,
      )
      const popupHtml = buildVesselPopupHtml(vessel, tRef.current)

      const existingMarker = vesselMarkersRef.current.get(vessel.mmsi)
      if (!existingMarker) {
        const marker = L.marker([vessel.lat, vessel.lon], { icon })
          .addTo(map)
          .bindPopup(popupHtml)
        vesselMarkersRef.current.set(vessel.mmsi, marker)
      } else {
        existingMarker.setLatLng([vessel.lat, vessel.lon])
        existingMarker.setIcon(icon)
        existingMarker.getPopup()?.setContent(popupHtml)
      }
    }

    for (const [mmsi, marker] of vesselMarkersRef.current) {
      if (!visibleMmsi.has(mmsi)) {
        marker.remove()
        vesselMarkersRef.current.delete(mmsi)
      }
    }
  }, [coords, vessels, showBoatTraffic, vesselCategories, vesselIconSizePx])

  if (!coords) return <MissingAddressNotice />

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {showBoatTraffic && <AisStatusBadge status={aisStatus} />}
      {isEditMode && (
        <button
          type="button"
          onClick={handleResetView}
          className="absolute bottom-2 right-2 z-[500] rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs font-medium text-surface-text shadow-md hover:bg-surface-hover"
        >
          {t('minimap.resetView')}
        </button>
      )}
    </div>
  )
}
