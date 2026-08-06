import type { LatLon } from '../geo/distance'
import { pointInGeometry, type GeoJsonGeometry } from '../geo/pointInPolygon'

const WARNINGS_URL =
  'https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json'

export type WarningLevel = 'MESSAGE' | 'YELLOW' | 'ORANGE' | 'RED'

const LEVEL_RANK: Record<WarningLevel, number> = {
  RED: 3,
  ORANGE: 2,
  YELLOW: 1,
  MESSAGE: 0,
}

function isWarningLevel(value: string): value is WarningLevel {
  return value in LEVEL_RANK
}

interface LocalizedText {
  sv: string
  en: string
  code?: string
}

interface RawDescription {
  title: LocalizedText
  text: LocalizedText
}

interface RawWarningArea {
  id: number
  approximateStart: string
  approximateEnd?: string
  areaName: LocalizedText
  warningLevel: LocalizedText
  eventDescription: LocalizedText
  descriptions: RawDescription[]
  /**
   * Every warningArea carries its own GeoJSON Feature with the specific
   * polygon it covers (a county or a named sea district like "Skagerrak") -
   * this is what's tested against the dashboard's coords, not
   * `affectedAreas` (which is just id/name, no geometry).
   */
  area?: {
    type: 'Feature'
    geometry: GeoJsonGeometry
  }
}

interface RawWarningEvent {
  id: number
  event: LocalizedText
  warningAreas: RawWarningArea[]
}

export interface WarningDescription {
  title: string
  text: string
}

export interface MarineWarning {
  id: number
  eventTitle: string
  eventCode: string | undefined
  areaName: string
  level: WarningLevel
  levelLabel: string
  eventDescription: string
  start: Date | null
  end: Date | null
  descriptions: WarningDescription[]
}

function localize(text: LocalizedText, locale: 'en' | 'sv'): string {
  return text[locale] || text.sv
}

/**
 * Fetches every currently-active SMHI warning (county-level and marine
 * sea-district warnings alike) and keeps only the ones whose own area
 * polygon actually contains `origin`, sorted most-severe first.
 */
export async function fetchWarningsNear(
  origin: LatLon,
  locale: 'en' | 'sv',
  init?: { signal?: AbortSignal },
): Promise<MarineWarning[]> {
  const response = await fetch(WARNINGS_URL, { signal: init?.signal })

  if (!response.ok) {
    throw new Error(
      `SMHI warnings request failed: ${response.status} ${response.statusText}`,
    )
  }

  const raw = (await response.json()) as RawWarningEvent[]
  const matches: MarineWarning[] = []

  for (const event of raw) {
    for (const warningArea of event.warningAreas) {
      if (!warningArea.area?.geometry) continue
      if (!pointInGeometry(origin, warningArea.area.geometry)) continue

      const levelCode = warningArea.warningLevel.code ?? ''
      if (!isWarningLevel(levelCode)) continue

      matches.push({
        id: warningArea.id,
        eventTitle: localize(event.event, locale),
        eventCode: event.event.code,
        areaName: localize(warningArea.areaName, locale),
        level: levelCode,
        levelLabel: localize(warningArea.warningLevel, locale),
        eventDescription: localize(warningArea.eventDescription, locale),
        start: warningArea.approximateStart
          ? new Date(warningArea.approximateStart)
          : null,
        end: warningArea.approximateEnd
          ? new Date(warningArea.approximateEnd)
          : null,
        descriptions: warningArea.descriptions.map((description) => ({
          title: localize(description.title, locale),
          text: localize(description.text, locale),
        })),
      })
    }
  }

  return matches.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
}
