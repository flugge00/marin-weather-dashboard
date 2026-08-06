/**
 * Buckets the numeric AIS ship type code (ITU-R M.1371, 0-99) into a small
 * set of categories a user can actually reason about when filtering the
 * minimap's boat traffic (task 8.7) - the raw codes are far too granular for
 * a settings checklist.
 */
export type VesselCategory =
  | 'cargo'
  | 'tanker'
  | 'passenger'
  | 'fishing'
  | 'pleasure'
  | 'highSpeed'
  | 'other'

export const VESSEL_CATEGORIES: VesselCategory[] = [
  'cargo',
  'tanker',
  'passenger',
  'fishing',
  'pleasure',
  'highSpeed',
  'other',
]

export function categorizeShipType(shipType: number | null): VesselCategory {
  if (shipType === null) return 'other'
  if (shipType === 30) return 'fishing'
  if (shipType === 36 || shipType === 37) return 'pleasure'
  if (shipType >= 40 && shipType <= 49) return 'highSpeed'
  if (shipType >= 60 && shipType <= 69) return 'passenger'
  if (shipType >= 70 && shipType <= 79) return 'cargo'
  if (shipType >= 80 && shipType <= 89) return 'tanker'
  return 'other'
}
