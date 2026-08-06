import type { TranslateFn } from '../../state/locale/context'

/** Formats a past epoch-ms timestamp as a short relative label ("3m ago"). */
export function formatRelativeTime(
  epochMs: number,
  t: TranslateFn,
  now: number = Date.now(),
): string {
  const diffSeconds = Math.max(0, Math.round((now - epochMs) / 1000))
  if (diffSeconds < 5) return t('relativeTime.justNow')
  if (diffSeconds < 60) return t('relativeTime.secondsAgo', { n: diffSeconds })

  const diffMinutes = Math.round(diffSeconds / 60)
  if (diffMinutes < 60) return t('relativeTime.minutesAgo', { n: diffMinutes })

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return t('relativeTime.hoursAgo', { n: diffHours })

  const diffDays = Math.round(diffHours / 24)
  return t('relativeTime.daysAgo', { n: diffDays })
}
