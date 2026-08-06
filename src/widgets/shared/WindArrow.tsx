interface WindArrowProps {
  /** Compass bearing in degrees the wind is blowing *from* (SMHI's `wind_from_direction`). */
  directionDeg: number
  className?: string
}

/**
 * Small arrow icon pointing the direction the wind is blowing *toward*
 * (task 6.1) - visually intuitive alongside the compass-letter text, and
 * uses the raw SMHI degree value so it's finer than the 45deg minimum.
 */
export function WindArrow({ directionDeg, className }: WindArrowProps) {
  const rotation = directionDeg + 180
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 20V4M12 4L6 10M12 4l6 6" />
    </svg>
  )
}
