import L from 'leaflet'

/**
 * Leaflet's default marker (PNG + CSS-relative image paths) rendered as a
 * broken-image icon under this project's Vite bundling (task 6.5) - sidestep
 * it entirely with an inline SVG pin, in the same hand-drawn line-icon style
 * as the rest of the app (see WeatherIcon.tsx).
 */
export function createPinIcon(color: string): L.DivIcon {
  const svg = `
    <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 1C6.8 1 1 6.8 1 14c0 9.75 11.6 21.9 12.1 22.4a1.3 1.3 0 0 0 1.8 0C15.4 35.9 27 23.75 27 14 27 6.8 21.2 1 14 1Z"
        fill="${color}"
        stroke="white"
        stroke-width="1.5"
      />
      <circle cx="14" cy="14" r="5" fill="white" />
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'minimap-pin-icon',
    iconSize: [28, 38],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
    tooltipAnchor: [0, -28],
  })
}
