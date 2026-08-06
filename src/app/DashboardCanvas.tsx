import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Fixed design resolution every dashboard page is authored against. */
export const CANVAS_WIDTH = 1024
export const CANVAS_HEIGHT = 768

/**
 * Scales a fixed 1024x768 canvas to fit whatever real viewport it's shown
 * on, via transform: scale() rather than responsive reflow. Widgets are
 * laid out once against a known resolution; the canvas is letterboxed
 * (never cropped, never scrollable) on any other aspect ratio.
 */
export function DashboardCanvas({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return

    const updateScale = (width: number, height: number) => {
      setScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT))
    }

    updateScale(outer.clientWidth, outer.clientHeight)

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      updateScale(width, height)
    })
    observer.observe(outer)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={outerRef}
      className="fixed inset-0 overflow-hidden bg-surface-base"
    >
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
