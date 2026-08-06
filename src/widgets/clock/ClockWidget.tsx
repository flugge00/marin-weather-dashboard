import { useEffect, useState } from 'react'
import { useLocale } from '../../state/locale/context'

/** Full-size clock widget (task 4.1). No API needed - reuses the top bar Clock's pattern. */
export function ClockWidget() {
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
      <span className="text-4xl font-semibold tabular-nums">
        {timeFormatter.format(now)}
      </span>
      <span className="text-base text-surface-muted capitalize">
        {dateFormatter.format(now)}
      </span>
    </div>
  )
}
