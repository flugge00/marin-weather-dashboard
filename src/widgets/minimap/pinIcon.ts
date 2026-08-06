import L from 'leaflet'

export type PinKind = 'home' | 'station'

const GLYPHS: Record<PinKind, string> = {
  // Small house glyph, marks the dashboard's configured address. Centered on
  // x=14 to match the pin's own center (the circle in the pin path below).
  home: '<path d="M9 15.5v-5.8l5-3.6 5 3.6v5.8h-3.4v-3.6H12.4v3.6H9Z" fill="white" stroke="none" />',
  // Small droplet glyph, marks the nearest water-temperature station.
  station:
    '<path d="M14 8.2c1.9 2.5 3.1 4.3 3.1 5.9a3.1 3.1 0 1 1-6.2 0c0-1.6 1.2-3.4 3.1-5.9Z" fill="white" stroke="none" />',
}

const DEFAULT_SIZE_PX = 28

/**
 * Leaflet's default marker (PNG + CSS-relative image paths) rendered as a
 * broken-image icon under this project's Vite bundling (task 6.5) - sidestep
 * it entirely with an inline SVG pin, in the same hand-drawn line-icon style
 * as the rest of the app (see WeatherIcon.tsx). Each pin also carries a small
 * glyph (house vs. droplet) so the address and water-station pins stay
 * distinguishable beyond just color (task 6.1.6), and the whole pin scales
 * with `sizePx` (adjustable per-widget in the minimap settings).
 */
export function createPinIcon(
  color: string,
  kind: PinKind,
  sizePx: number = DEFAULT_SIZE_PX,
): L.DivIcon {
  const width = sizePx
  const height = Math.round((sizePx * 38) / 28)
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 1C6.8 1 1 6.8 1 14c0 9.75 11.6 21.9 12.1 22.4a1.3 1.3 0 0 0 1.8 0C15.4 35.9 27 23.75 27 14 27 6.8 21.2 1 14 1Z"
        fill="${color}"
        stroke="white"
        stroke-width="1.5"
      />
      ${GLYPHS[kind]}
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'minimap-pin-icon',
    iconSize: [width, height],
    iconAnchor: [width / 2, height - 2],
    popupAnchor: [0, -(height - 6)],
    tooltipAnchor: [0, -(height - 10)],
  })
}
