import { useEffect, useState } from 'react'
import { useLocale } from '../state/locale/context'

/** Live clock for the top bar. The full-size clock widget (4.1) is separate and reuses this pattern. */
export function Clock() {
  const { locale } = useLocale()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-lg font-semibold tabular-nums">
        {timeFormatter.format(now)}
      </span>
      <span className="text-xs text-surface-muted capitalize">
        {dateFormatter.format(now)}
      </span>
    </div>
  )
}
