import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { useAppSettings } from '../../state/appSettings/context'
import { useDashboardConfig } from '../../state/dashboardConfig/context'
import { useDataSource } from '../../lib/dataSource/useDataSource'
import { fetchNearestWaterTemperature } from '../../lib/smhi/waterTemperatureClient'
import { MissingAddressNotice } from '../shared/MissingAddressNotice'
import { createPinIcon } from './pinIcon'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors'
const DEFAULT_ZOOM = 13
const FIT_BOUNDS_PADDING: [number, number] = [24, 24]

const addressPin = createPinIcon('#2f83fa')
const stationPin = createPinIcon('#ef4444')

/**
 * Preview-only Leaflet map centered on the dashboard's address (task 4.6).
 * Panning/dragging stays disabled (it's a glance-only preview, not a full
 * map), but zoom buttons are enabled (task 6.4) and the nearest water-temp
 * station is plotted alongside the address so you can see how far it is
 * (task 6.7).
 */
export function MinimapWidget() {
  const { config } = useDashboardConfig()
  const { refreshIntervalMs } = useAppSettings()
  const coords = config.coords

  const { data: station } = useDataSource(
    (signal) => {
      if (!coords) return Promise.reject(new Error('No address configured'))
      return fetchNearestWaterTemperature(coords, { signal })
    },
    { intervalMs: coords ? refreshIntervalMs : null },
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const addressMarkerRef = useRef<L.Marker | null>(null)
  const stationMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!coords || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [coords.lat, coords.lon],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
      dragging: false,
      touchZoom: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: false,
    })
    mapRef.current = map

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map)

    addressMarkerRef.current = L.marker([coords.lat, coords.lon], {
      icon: addressPin,
    }).addTo(map)

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      addressMarkerRef.current = null
      stationMarkerRef.current = null
    }
  }, [coords])

  // Plots/updates the nearest water-temperature station as a second pin
  // (task 6.7), separate from map setup so a data refresh doesn't recreate
  // the whole map.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !coords) return

    if (!station) {
      stationMarkerRef.current?.remove()
      stationMarkerRef.current = null
      return
    }

    if (!stationMarkerRef.current) {
      stationMarkerRef.current = L.marker([station.station.lat, station.station.lon], {
        icon: stationPin,
      }).addTo(map)
    } else {
      stationMarkerRef.current.setLatLng([station.station.lat, station.station.lon])
    }

    stationMarkerRef.current
      .bindTooltip(
        `${station.station.name} · ${station.distanceKm.toFixed(1)} km`,
        { direction: 'top', permanent: false },
      )

    map.fitBounds(
      L.latLngBounds(
        [coords.lat, coords.lon],
        [station.station.lat, station.station.lon],
      ),
      { padding: FIT_BOUNDS_PADDING, maxZoom: DEFAULT_ZOOM },
    )
  }, [coords, station])

  if (!coords) return <MissingAddressNotice />

  return <div ref={containerRef} className="h-full w-full" />
}
