import { categorizeShipType } from '../../lib/ais/shipType'
import type { AisVessel } from '../../lib/ais/types'
import type { TranslateFn } from '../../state/locale/context'
import { VESSEL_CATEGORY_LABEL_KEY } from './vesselCategoryLabels'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const EM_DASH = '—'

/**
 * Marker-tap popover content for a vessel (task 8.6): name, type, speed,
 * heading/course, destination if available. Vessel name/destination come
 * straight from AIS ShipStaticData - any vessel operator can set them - so
 * they're HTML-escaped before going into the popup's innerHTML.
 */
export function buildVesselPopupHtml(
  vessel: AisVessel,
  t: TranslateFn,
): string {
  const name = vessel.name ? escapeHtml(vessel.name) : `MMSI ${vessel.mmsi}`
  const category = t(
    VESSEL_CATEGORY_LABEL_KEY[categorizeShipType(vessel.shipType)],
  )
  const speed =
    vessel.speedKnots !== null
      ? t('vessel.speedValue', { knots: vessel.speedKnots.toFixed(1) })
      : EM_DASH
  const headingDeg = vessel.headingDeg ?? vessel.courseDeg
  const heading = headingDeg !== null ? `${Math.round(headingDeg)}°` : EM_DASH
  const destination = vessel.destination
    ? escapeHtml(vessel.destination)
    : EM_DASH

  return `
    <div class="text-sm">
      <div class="mb-1 font-semibold">${name}</div>
      <div>${t('vessel.type')}: ${category}</div>
      <div>${t('vessel.speed')}: ${speed}</div>
      <div>${t('vessel.heading')}: ${heading}</div>
      <div>${t('vessel.destination')}: ${destination}</div>
    </div>
  `
}
