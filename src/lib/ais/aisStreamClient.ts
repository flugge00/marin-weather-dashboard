import { useEffect, useRef, useState } from 'react'
import type { LatLon } from '../geo/distance'
import { boundingBoxAroundKm } from './boundingBox'
import type { AisConnectionStatus, AisVessel } from './types'

const STREAM_URL = 'wss://stream.aisstream.io/v0/stream'
const RECONNECT_BASE_DELAY_MS = 2_000
const RECONNECT_MAX_DELAY_MS = 30_000
/** Vessels that stop reporting for this long are dropped (task 8.2). */
const DEFAULT_VESSEL_TIMEOUT_MS = 10 * 60 * 1000
/** Batch fast-arriving position updates instead of re-rendering per message. */
const FLUSH_INTERVAL_MS = 1_500

interface AisRawPositionReportMessage {
  MessageType: 'PositionReport'
  Message: {
    PositionReport: {
      Latitude: number
      Longitude: number
      Cog?: number
      Sog?: number
      TrueHeading?: number
      NavigationalStatus?: number
    }
  }
  MetaData?: { MMSI?: number }
  Metadata?: { MMSI?: number }
}

interface AisRawShipStaticDataMessage {
  MessageType: 'ShipStaticData'
  Message: {
    ShipStaticData: {
      Name?: string
      Type?: number
      Destination?: string
      CallSign?: string
    }
  }
  MetaData?: { MMSI?: number }
  Metadata?: { MMSI?: number }
}

type AisRawMessage = AisRawPositionReportMessage | AisRawShipStaticDataMessage

function cleanText(value: string | undefined): string | null {
  const trimmed = value?.replaceAll('@', '').trim()
  return trimmed ? trimmed : null
}

export interface UseAisVesselsOptions {
  apiKey: string | null
  center: LatLon | null
  radiusKm: number
  enabled: boolean
  vesselTimeoutMs?: number
}

export interface UseAisVesselsResult {
  vessels: AisVessel[]
  status: AisConnectionStatus
}

/**
 * Live boat-traffic feed for the minimap (Phase 8): opens a WebSocket to
 * aisstream.io, subscribes to a bounding box around the dashboard's address,
 * and maintains a per-MMSI vessel map from PositionReport/ShipStaticData
 * messages. Reconnects with backoff on drop; vessels that stop reporting are
 * expired after `vesselTimeoutMs` so the map doesn't accumulate ghosts.
 *
 * This is push-based (not `useDataSource`'s poll model), so it manages its
 * own connection lifecycle - it re-subscribes (closes + reopens) whenever
 * the key/center/radius changes, since aisstream.io's subscription is set
 * once per connection, not updatable mid-stream.
 */
export function useAisVessels({
  apiKey,
  center,
  radiusKm,
  enabled,
  vesselTimeoutMs = DEFAULT_VESSEL_TIMEOUT_MS,
}: UseAisVesselsOptions): UseAisVesselsResult {
  const [vessels, setVessels] = useState<AisVessel[]>([])
  // Only the "actually trying to connect" states live in React state; `idle`
  // and `no-key` are derived below since they never need to be *set* from
  // inside the effect (setting them there directly would be a synchronous
  // setState-in-effect, which the "attempt a connection" cases below can't
  // avoid but these trivially-derived ones don't need to risk).
  const [connectionStatus, setConnectionStatus] =
    useState<Exclude<AisConnectionStatus, 'idle' | 'no-key'>>('connecting')

  const vesselMapRef = useRef<Map<number, AisVessel>>(new Map())
  const dirtyRef = useRef(false)

  useEffect(() => {
    if (!enabled || !center || !apiKey) return

    let cancelled = false
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let reconnectDelay = RECONNECT_BASE_DELAY_MS

    const connect = () => {
      if (cancelled) return
      setConnectionStatus('connecting')
      socket = new WebSocket(STREAM_URL)

      socket.onopen = () => {
        if (cancelled || !socket) return
        reconnectDelay = RECONNECT_BASE_DELAY_MS
        socket.send(
          JSON.stringify({
            APIKey: apiKey,
            BoundingBoxes: [boundingBoxAroundKm(center, radiusKm)],
            FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
          }),
        )
        setConnectionStatus('live')
      }

      socket.onmessage = (event) => {
        if (cancelled) return
        let raw: AisRawMessage
        try {
          raw = JSON.parse(event.data as string) as AisRawMessage
        } catch {
          return
        }

        const mmsi =
          ('MetaData' in raw ? raw.MetaData?.MMSI : undefined) ??
          ('Metadata' in raw ? raw.Metadata?.MMSI : undefined)
        if (!mmsi) return

        const existing = vesselMapRef.current.get(mmsi)

        if (raw.MessageType === 'PositionReport') {
          const report = raw.Message.PositionReport
          vesselMapRef.current.set(mmsi, {
            mmsi,
            lat: report.Latitude,
            lon: report.Longitude,
            courseDeg:
              report.Cog !== undefined && report.Cog < 360 ? report.Cog : null,
            headingDeg:
              report.TrueHeading !== undefined && report.TrueHeading < 360
                ? report.TrueHeading
                : null,
            speedKnots:
              report.Sog !== undefined && report.Sog < 102.3
                ? report.Sog
                : null,
            navigationalStatus: report.NavigationalStatus ?? null,
            shipType: existing?.shipType ?? null,
            name: existing?.name ?? null,
            callSign: existing?.callSign ?? null,
            destination: existing?.destination ?? null,
            lastPositionAt: Date.now(),
            lastStaticAt: existing?.lastStaticAt ?? null,
          })
          dirtyRef.current = true
        } else if (raw.MessageType === 'ShipStaticData' && existing) {
          const staticData = raw.Message.ShipStaticData
          vesselMapRef.current.set(mmsi, {
            ...existing,
            shipType: staticData.Type ?? existing.shipType,
            name: cleanText(staticData.Name) ?? existing.name,
            callSign: cleanText(staticData.CallSign) ?? existing.callSign,
            destination:
              cleanText(staticData.Destination) ?? existing.destination,
            lastStaticAt: Date.now(),
          })
          dirtyRef.current = true
        }
      }

      socket.onerror = () => {
        if (cancelled) return
        setConnectionStatus('error')
      }

      socket.onclose = () => {
        if (cancelled) return
        setConnectionStatus('error')
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY_MS)
          connect()
        }, reconnectDelay)
      }
    }

    connect()

    const vesselMap = vesselMapRef.current
    const flushId = setInterval(() => {
      const now = Date.now()
      let expired = false
      for (const [mmsi, vessel] of vesselMap) {
        if (now - vessel.lastPositionAt > vesselTimeoutMs) {
          vesselMap.delete(mmsi)
          expired = true
        }
      }
      if (dirtyRef.current || expired) {
        dirtyRef.current = false
        setVessels([...vesselMap.values()])
      }
    }, FLUSH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(flushId)
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
      vesselMap.clear()
      setVessels([])
    }
    // Deliberately keyed on center's lat/lon rather than the `center` object
    // itself, so a new-but-equal coords object doesn't force a reconnect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, center?.lat, center?.lon, radiusKm, enabled, vesselTimeoutMs])

  const status: AisConnectionStatus =
    !enabled || !center ? 'idle' : !apiKey ? 'no-key' : connectionStatus

  return { vessels, status }
}
