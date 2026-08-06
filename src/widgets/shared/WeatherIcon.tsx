import type { ReactNode } from 'react'
import type { WeatherCondition } from '../../lib/smhi/weatherSymbol'

interface WeatherIconProps {
  category: WeatherCondition['category']
  className?: string
}

/**
 * Consistent line-icon set for weather conditions (task 5.3), replacing the
 * earlier emoji stand-in. All icons share a 24x24 viewBox, 1.6px stroke, and
 * currentColor so they inherit whatever text color/size a widget applies.
 */
export function WeatherIcon({ category, className }: WeatherIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[category]}
    </svg>
  )
}

const sun = (
  <>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
  </>
)

const cloud = (
  <path d="M7.5 18.5h9a4 4 0 0 0 .5-7.97 5.5 5.5 0 0 0-10.6-1.8A4.5 4.5 0 0 0 7.5 18.5Z" />
)

const cloudSmall = (
  <path d="M8 17h8a3.3 3.3 0 0 0 .4-6.6 4.6 4.6 0 0 0-8.85-1.5A3.7 3.7 0 0 0 8 17Z" />
)

const rainDrops = (
  <>
    <path d="M9 20.5c-.6-1.2.9-2.6 1.5-3.7.6 1.1 2.1 2.5 1.5 3.7a1.5 1.5 0 0 1-3 0Z" />
    <path d="M14 20.5c-.6-1.2.9-2.6 1.5-3.7.6 1.1 2.1 2.5 1.5 3.7a1.5 1.5 0 0 1-3 0Z" />
  </>
)

const snowFlakes = (
  <>
    <path d="M9.5 17.5v4M7.4 18.7l4.2 1.6M11.6 18.7l-4.2 1.6" />
    <path d="M15.5 17.5v4M13.4 18.7l4.2 1.6M17.6 18.7l-4.2 1.6" />
  </>
)

const sleetMix = (
  <>
    <path d="M9 20.7c-.5-1-.8-2.3 1-3.4.7 1.1 1.5 2.4 1 3.4a1.15 1.15 0 0 1-2 0Z" />
    <path d="M14.7 17.8v3.2M13 18.7l3.4 1.3M16.4 18.7l-3.4 1.3" />
  </>
)

const bolt = <path d="M13 15.5h4l-6 7 1.3-5.3H9l6-7-1.3 5.3Z" />

const fogLines = (
  <>
    <path d="M4 16h13M4 19.5h16M7.5 12.5h11" />
  </>
)

const ICON_PATHS: Record<WeatherCondition['category'], ReactNode> = {
  clear: sun,
  'partly-cloudy': (
    <>
      <g transform="translate(-2.4,-2.4) scale(0.72)">{sun}</g>
      {cloudSmall}
    </>
  ),
  cloudy: cloud,
  fog: (
    <>
      <path d="M7.8 12.8h8.4a3.6 3.6 0 0 0 .4-7.18A5 5 0 0 0 6.9 4.1a4.1 4.1 0 0 0 .9 8.7Z" />
      {fogLines}
    </>
  ),
  rain: (
    <>
      {cloudSmall}
      {rainDrops}
    </>
  ),
  sleet: (
    <>
      {cloudSmall}
      {sleetMix}
    </>
  ),
  snow: (
    <>
      {cloudSmall}
      {snowFlakes}
    </>
  ),
  thunder: (
    <>
      {cloudSmall}
      {bolt}
    </>
  ),
}
