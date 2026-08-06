/** A vessel's known state, built up from aisstream.io PositionReport + ShipStaticData messages. */
export interface AisVessel {
  mmsi: number
  lat: number
  lon: number
  /** Course over ground, degrees (0-359.9), or null if not reported. */
  courseDeg: number | null
  /** True heading, degrees, or null if not available (AIS reports 511 for "not available"). */
  headingDeg: number | null
  speedKnots: number | null
  navigationalStatus: number | null
  /** Numeric AIS ship type code (ITU-R M.1371), or null until ShipStaticData arrives. */
  shipType: number | null
  name: string | null
  callSign: string | null
  destination: string | null
  /** `Date.now()` of the last PositionReport received for this vessel. */
  lastPositionAt: number
  /** `Date.now()` of the last ShipStaticData received for this vessel, if any. */
  lastStaticAt: number | null
}

export type AisConnectionStatus =
  'idle' | 'no-key' | 'connecting' | 'live' | 'error'
