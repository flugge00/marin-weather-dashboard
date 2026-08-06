interface TrendArrowProps {
  direction: 'up' | 'down' | 'flat'
  className?: string
}

/**
 * Rising/falling/steady indicator shared by sea level and pressure. All
 * three states reuse the same chevron-arrow shape, just rotated - "flat" is
 * a sideways arrow rather than a bare horizontal line, since a plain line
 * with no arrowhead reads as a stray hyphen next to a number, not a trend.
 */
export function TrendArrow({ direction, className }: TrendArrowProps) {
  const rotation = direction === 'up' ? 0 : direction === 'down' ? 180 : 90
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
