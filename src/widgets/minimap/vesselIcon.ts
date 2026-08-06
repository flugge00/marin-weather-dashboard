import L from 'leaflet'
import type { VesselCategory } from '../../lib/ais/shipType'

const CATEGORY_COLORS: Record<VesselCategory, string> = {
  cargo: '#f59e0b',
  tanker: '#ef4444',
  passenger: '#8b5cf6',
  fishing: '#10b981',
  pleasure: '#2f83fa',
  highSpeed: '#ec4899',
  other: '#6b7280',
}

/**
 * Small arrow-shaped marker for a live AIS vessel (Phase 8), rotated to the
 * vessel's heading (falling back to course-over-ground when no heading is
 * reported). Deliberately smaller/simpler than the address/station pins
 * (task 6.1.6 precedent) since there can be many of these at once and they
 * shouldn't obstruct the map.
 */
export function createVesselIcon(
  category: VesselCategory,
  rotationDeg: number | null,
  sizePx: number,
): L.DivIcon {
  const color = CATEGORY_COLORS[category]
  const rotation = rotationDeg ?? 0
  const opacity = rotationDeg === null ? 0.55 : 1
  const svg = `
    <svg width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" style="transform: rotate(${rotation}deg); opacity: ${opacity}">
      <path d="M12 1.5 18 21 12 17.2 6 21Z" fill="${color}" stroke="white" stroke-width="1.4" stroke-linejoin="round" />
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'minimap-vessel-icon',
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
    popupAnchor: [0, -sizePx / 2],
  })
}
