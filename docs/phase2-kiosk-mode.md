# Phase 2.5 — Keeping the screen awake in kiosk mode

The app requests a screen Wake Lock (`navigator.wakeLock.request('screen')`,
see [src/lib/wakeLock/useWakeLock.ts](../src/lib/wakeLock/useWakeLock.ts))
whenever the dashboard is in kiosk mode, and re-acquires it on
`visibilitychange` (the lock is released automatically by the browser
whenever the tab is hidden).

## Why this isn't sufficient on its own

Wake Lock support on iPadOS Safari is inconsistent across versions and
differs between a regular Safari tab and a standalone "Add to Home Screen"
PWA (the mode this dashboard is meant to run in — see Phase 6). It should be
treated as a nice-to-have that reduces how often you hit the device's
auto-lock, not as something to depend on for an always-on kitchen display.

## Reliable fallback (do this on the iPad regardless)

1. **Settings → Display & Brightness → Auto-Lock → Never.** This is the
   simplest fix and is enough on its own for a dedicated/always-plugged-in
   display device.
2. **Guided Access** (Settings → Accessibility → Guided Access), if you want
   the iPad locked to only this one app/page (e.g. a shared kitchen device
   where you don't want anyone swiping away to another app): triple-click
   the side/home button while the dashboard is open to start a pinned
   session.

Both are documented again in Phase 6 (iPad deployment) as an end-to-end
checklist item once the app is actually running on the device.
