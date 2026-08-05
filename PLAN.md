# Marin Weather Dashboard — Project Plan

A fullscreen, always-on kitchen dashboard (iPad) showing weather, water temperature,
a short-range forecast, a clock, and (later) boat traffic — built around a
configurable, drag-and-drop widget grid that never scrolls.

## Architecture decision

**Fully static site, no backend.** The iPad's browser fetches data directly from
public APIs; dashboard configurations live in the browser's `localStorage`.

This keeps the project simple to build and host (a static bundle deployed to any
free static host), at the cost of two tradeoffs worth remembering as we build:

1. **CORS risk.** SMHI's public APIs are typically fine to call from a browser,
   but this must be verified early (task 1.1) since it affects every widget. If
   any endpoint blocks browser requests, the fallback is a single small
   serverless function (e.g. a Netlify/Vercel function) that does nothing but
   proxy that one call — not a full backend.
2. **Config is per-device/per-browser.** Because there's no server, a dashboard
   configuration edited on your laptop won't automatically appear on the iPad.
   Two mitigations are built into the plan: (a) editing works fine directly on
   the iPad itself in "edit mode," and (b) an Export/Import-as-JSON feature lets
   you author a config elsewhere and load it onto the iPad manually (task 5.5).

## Recommended tech stack

| Concern                       | Choice                                          | Why                                                                                               |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Framework                     | React + TypeScript + Vite                       | Simple, fast dev loop, huge ecosystem, easy static build                                          |
| Styling                       | Tailwind CSS                                    | Fast to build a polished, consistent look; easy responsive/scaling utilities                      |
| Widget grid / drag-resize     | `react-grid-layout`                             | Purpose-built for movable/resizable dashboard widgets, serializes layout to JSON                  |
| Minimap                       | Leaflet + OpenStreetMap tiles                   | Free, no API key, easy to set to "preview only" (interactions disabled)                           |
| Geocoding (address → lat/lon) | Nominatim (OpenStreetMap)                       | Free, no key, fine for occasional lookups (one-time address search, not per-refresh)              |
| Persistence                   | `localStorage` (via a small typed wrapper)      | No backend; simple JSON blobs per dashboard config                                                |
| PWA / fullscreen on iPad      | `vite-plugin-pwa` + web app manifest            | "Add to Home Screen" gives a true fullscreen standalone mode in iPadOS Safari (no browser chrome) |
| Hosting                       | Cloudflare Pages / Netlify / Vercel (free tier) | Push-to-deploy static hosting, gives you a stable URL to navigate the iPad to                     |

## Data sources

- **Weather (current + forecast):** SMHI Open Data — Meteorological Forecasts API.
  `GET https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/{lon}/lat/{lat}/data.json`
  Returns ~10 days of forecast, hourly resolution near-term, coarser further out.
  Docs: https://opendata.smhi.se/apidocs/metfcst/
- **Water temperature:** SMHI Open Data — Oceanographic Observations (`ocobs`) API.
  Docs: https://opendata.smhi.se/apidocs/ocobs/ — used to find the nearest station
  to the selected address and pull its latest water temperature reading.
- **Boat traffic (future phase):** No free official API from Sjöfartsverket
  (their AIS data is request/quote-based). Best free option found:
  **aisstream.io** — free real-time global AIS via WebSocket
  (`wss://stream.aisstream.io/v0/stream`), filterable by bounding box, requires a
  free API key. Note: since we have no backend, the key would live in
  client-side code — acceptable for a personal free-tier key, but worth a second
  look before shipping this phase.

---

## Phase 0 — Project setup

- [ ] 0.1 Scaffold Vite + React + TypeScript project
- [ ] 0.2 Add Tailwind CSS and base design tokens (colors, spacing, font scale)
- [ ] 0.3 Set up ESLint/Prettier, basic folder structure (`widgets/`, `lib/`, `state/`)
- [ ] 0.4 Set up static hosting (Cloudflare Pages/Netlify/Vercel) with push-to-deploy from the repo
- [ ] 0.5 Add PWA manifest + icons so "Add to Home Screen" launches fullscreen/standalone on iPadOS

## Phase 1 — Data layer

- [ ] 1.1 Spike: confirm SMHI forecast + ocobs endpoints work from a plain browser `fetch` (CORS check). Document fallback plan if not.
- [ ] 1.2 Build a small typed SMHI forecast client (current conditions + multi-day forecast, parsed into a clean internal shape)
- [ ] 1.3 Build nearest-station lookup for water temperature: given lat/lon, query `ocobs` station list, compute nearest station with recent data, fetch latest reading
- [ ] 1.4 Build a generic "data source" wrapper used by every widget that tracks: last successful sync time, last error, loading state, and status (`ok` / `stale` / `error`)
- [ ] 1.5 Implement configurable polling (default: every 60s, adjustable in settings) + manual "force refresh" action
- [ ] 1.6 Address → coordinates: integrate Nominatim geocoding for the one-time "where is this dashboard about" setup step

## Phase 2 — App shell: fullscreen, no-scroll, paging

- [ ] 2.1 Build the "page" concept: a fixed-canvas container (e.g. designed at 1024×768) that always scales via `transform: scale()` (computed from `ResizeObserver`/viewport size) to fit the real screen exactly — no scrollbars, ever
- [ ] 2.2 Multi-page support: swipe/tap to move between pages, page indicator dots, keyboard/tap zones for iPad
- [ ] 2.3 Global top bar: dashboard name, clock, connectivity/sync status summary
- [ ] 2.4 Kiosk mode vs. Edit mode toggle (edit mode reveals widget drag handles, add/remove widget UI, settings gear icons; kiosk mode is clean for daily display)
- [ ] 2.5 Prevent iPad Safari from sleeping/dimming during kiosk mode (Wake Lock API where supported; document iPad "Guided Access" / Auto-Lock=Never as the reliable fallback)

## Phase 3 — Widget grid & configuration engine

- [ ] 3.1 Integrate `react-grid-layout` for drag/resize/reposition of widgets within a page
- [ ] 3.2 Define the dashboard config schema: `{ id, name, address, coords, pages: [{ widgets: [{ id, type, layout, settings }] }] }`
- [ ] 3.3 `localStorage` persistence layer: load/save configs, list all saved configs
- [ ] 3.4 Config manager UI: create, rename, duplicate, delete dashboards; switch the active/displayed dashboard
- [ ] 3.5 Export current config as JSON (download/share) and Import a config from JSON — the manual workaround for the "no backend" sync gap
- [ ] 3.6 Per-widget settings panel pattern (gear icon in edit mode → popover/modal for that widget's options)

## Phase 4 — Widgets

- [ ] 4.1 **Clock widget** — current time/date, large readable typography, no API needed
- [ ] 4.2 **Weather widget** — current temp, wind speed, wind direction, sky condition (icon), from SMHI; sync status icon + "last synced" label
- [ ] 4.3 Weather widget settings — user can choose which fields show and reorder them (drag list in the settings popover; persisted per-widget in config)
- [ ] 4.4 **Water widget** — water temperature + name of the source station; sync status + last synced
- [ ] 4.5 **Forecast widget** — compact forecast view with a selector for 12h / 24h / 3 days / 1 week; render as a simple horizontal strip (temp + icon per interval), scales down cleanly at small widget sizes
- [ ] 4.6 **Minimap widget** — Leaflet map centered/zoomed to the configured address, all interaction (drag/zoom/click-to-select) disabled — preview only
- [ ] 4.7 Shared widget chrome: consistent card style, status dot (green/yellow/red), last-synced timestamp, loading/error states

## Phase 5 — Styling & polish

- [ ] 5.1 Define a cohesive visual theme (palette, type scale, spacing) suited to an always-on kitchen display — legible from a few feet away
- [ ] 5.2 Optional day/night theme (auto-dim or switch palette based on time of day, since it's always on)
- [ ] 5.3 Icon set for weather conditions (sun/cloud/rain/wind etc.) — consistent style across widgets
- [ ] 5.4 Smooth transitions: page swipes, widget status changes, refresh pulses
- [ ] 5.5 Empty/first-run state: guided setup for "enter your address" when no dashboard config exists yet

## Phase 6 — iPad deployment

- [ ] 6.1 Deploy to chosen static host, confirm stable URL
- [ ] 6.2 On iPad: open URL in Safari → Add to Home Screen → verify fullscreen standalone launch
- [ ] 6.3 Configure iPad Settings: Auto-Lock → Never (or Guided Access pinned to the dashboard) so the display stays on
- [ ] 6.4 End-to-end test: fresh dashboard creation, address entry, widget placement, save/rename/duplicate/delete, page switching, forced refresh, and a simulated API failure (airplane mode) to confirm status indicators behave correctly

## Phase 7 — Future: boat traffic on the minimap

- [ ] 7.1 Prototype `aisstream.io` WebSocket feed filtered to a bounding box around the configured address
- [ ] 7.2 Plot live vessel positions as pressable markers on the minimap
- [ ] 7.3 Marker tap → popover with vessel stats (name, type, speed, heading, destination if available)
- [ ] 7.4 Decide whether the API key exposure (client-side, static site) is acceptable long-term or warrants a minimal proxy at that point

---

## Open decisions to make along the way

- Exact address/coordinates to center the dashboard on (entered during first-run setup, Phase 5.5)
- Visual theme direction (light/dark/auto, color palette) — can be a quick style exploration once Phase 0 scaffolding is in place
- Whether 1 page or multiple pages are needed for launch, and what lives on page 2+
