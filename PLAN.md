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
  `GET https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/{lon}/lat/{lat}/data.json`
  Returns ~10 days of forecast, hourly resolution near-term, coarser further on.
  Docs: https://opendata.smhi.se/apidocs/metfcst/ — note: the previously-planned
  `pmp3g` endpoint was deprecated by SMHI on 2026-03-31 and replaced by `snow1g`;
  see [docs/phase1-cors-spike.md](docs/phase1-cors-spike.md) for the verified
  request/response shape.
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

- [x] 0.1 Scaffold Vite + React + TypeScript project
- [x] 0.2 Add Tailwind CSS and base design tokens (colors, spacing, font scale)
- [x] 0.3 Set up ESLint/Prettier, basic folder structure (`widgets/`, `lib/`, `state/`)
- [/] 0.4 Set up static hosting (Cloudflare Pages/Netlify/Vercel) with push-to-deploy from the repo
- [x] 0.5 Add PWA manifest + icons so "Add to Home Screen" launches fullscreen/standalone on iPadOS

## Phase 1 — Data layer

- [x] 1.1 Spike: confirm SMHI forecast + ocobs endpoints work from a plain browser `fetch` (CORS check). Document fallback plan if not. — see [docs/phase1-cors-spike.md](docs/phase1-cors-spike.md); all three endpoints (SMHI forecast, ocobs, Nominatim) are CORS-clean, no proxy needed. Found and fixed a deprecated SMHI endpoint along the way.
- [x] 1.2 Build a small typed SMHI forecast client (current conditions + multi-day forecast, parsed into a clean internal shape) — [src/lib/smhi/forecastClient.ts](src/lib/smhi/forecastClient.ts), [types.ts](src/lib/smhi/types.ts), [weatherSymbol.ts](src/lib/smhi/weatherSymbol.ts)
- [x] 1.3 Build nearest-station lookup for water temperature: given lat/lon, query `ocobs` station list, compute nearest station with recent data, fetch latest reading — [src/lib/smhi/waterTemperatureClient.ts](src/lib/smhi/waterTemperatureClient.ts), using the all-stations latest-hour feed rather than per-station lookups (see spike doc); distance via [src/lib/geo/distance.ts](src/lib/geo/distance.ts)
- [x] 1.4 Build a generic "data source" wrapper used by every widget that tracks: last successful sync time, last error, loading state, and status (`ok` / `stale` / `error`) — [src/lib/dataSource/useDataSource.ts](src/lib/dataSource/useDataSource.ts)
- [x] 1.5 Implement configurable polling (default: every 60s, adjustable in settings) + manual "force refresh" action — built into `useDataSource` (`intervalMs` option + `refresh()`)
- [x] 1.6 Address → coordinates: integrate Nominatim geocoding for the one-time "where is this dashboard about" setup step — [src/lib/geocode/nominatim.ts](src/lib/geocode/nominatim.ts)

## Phase 2 — App shell: fullscreen, no-scroll, paging

- [x] 2.1 Build the "page" concept: a fixed-canvas container (e.g. designed at 1024×768) that always scales via `transform: scale()` (computed from `ResizeObserver`/viewport size) to fit the real screen exactly — no scrollbars, ever — [src/app/DashboardCanvas.tsx](src/app/DashboardCanvas.tsx)
- [x] 2.2 Multi-page support: swipe/tap to move between pages, page indicator dots, keyboard/tap zones for iPad — [src/app/PageDeck.tsx](src/app/PageDeck.tsx), [PageIndicator.tsx](src/app/PageIndicator.tsx), [src/state/pageNav.ts](src/state/pageNav.ts)
- [x] 2.3 Global top bar: dashboard name, clock, connectivity/sync status summary — [src/app/TopBar.tsx](src/app/TopBar.tsx), [Clock.tsx](src/app/Clock.tsx), using [src/lib/connectivity/useOnlineStatus.ts](src/lib/connectivity/useOnlineStatus.ts) for the connectivity indicator (per-widget sync status rollup lands with the widgets in Phase 4)
- [x] 2.4 Kiosk mode vs. Edit mode toggle (edit mode reveals widget drag handles, add/remove widget UI, settings gear icons; kiosk mode is clean for daily display) — [src/state/uiMode.tsx](src/state/uiMode.tsx)/[uiModeContext.ts](src/state/uiModeContext.ts), toggle button in TopBar; edit-only affordances now live in the real widget grid, [src/app/WidgetGrid.tsx](src/app/WidgetGrid.tsx) (Phase 3)
- [x] 2.5 Prevent iPad Safari from sleeping/dimming during kiosk mode (Wake Lock API where supported; document iPad "Guided Access" / Auto-Lock=Never as the reliable fallback) — [src/lib/wakeLock/useWakeLock.ts](src/lib/wakeLock/useWakeLock.ts), see [docs/phase2-kiosk-mode.md](docs/phase2-kiosk-mode.md)

## Phase 3 — Widget grid & configuration engine

- [x] 3.1 Integrate `react-grid-layout` for drag/resize/reposition of widgets within a page — [src/app/WidgetGrid.tsx](src/app/WidgetGrid.tsx); grid is measured against its own container (ResizeObserver, same pattern as [DashboardCanvas.tsx](src/app/DashboardCanvas.tsx)) rather than assuming the full 1024×768 canvas, since the top bar/page indicator eat into it. Uses react-grid-layout v2's `GridLayout` (its API is a rewrite of the older v1/`react-grid-layout` docs you may find online — `gridConfig`/`dragConfig`/`resizeConfig` objects, not flat props)
- [x] 3.2 Define the dashboard config schema: `{ id, name, address, coords, pages: [{ widgets: [{ id, type, layout, settings }] }] }` — [src/state/dashboardConfig/types.ts](src/state/dashboardConfig/types.ts)
- [x] 3.3 `localStorage` persistence layer: load/save configs, list all saved configs — [src/lib/storage/localStorageJson.ts](src/lib/storage/localStorageJson.ts) (typed wrapper), [src/lib/storage/dashboardStore.ts](src/lib/storage/dashboardStore.ts) (CRUD + active-dashboard bookkeeping), wired into the app via [src/state/dashboardConfig/DashboardConfigProvider.tsx](src/state/dashboardConfig/DashboardConfigProvider.tsx)/[context.ts](src/state/dashboardConfig/context.ts)
- [x] 3.4 Config manager UI: create, rename, duplicate, delete dashboards; switch the active/displayed dashboard — [src/app/DashboardManagerModal.tsx](src/app/DashboardManagerModal.tsx), opened via a "Dashboards" button in [TopBar.tsx](src/app/TopBar.tsx) (edit mode only)
- [x] 3.5 Export current config as JSON (download/share) and Import a config from JSON — the manual workaround for the "no backend" sync gap — same modal as 3.4; imports are shape-validated before touching storage, see [src/state/dashboardConfig/validate.ts](src/state/dashboardConfig/validate.ts)
- [x] 3.6 Per-widget settings panel pattern (gear icon in edit mode → popover/modal for that widget's options) — [src/app/WidgetSettingsPanel.tsx](src/app/WidgetSettingsPanel.tsx) reads a `renderSettings` form from the widget registry ([src/widgets/registry.ts](src/widgets/registry.ts)); proven end-to-end with a demo `placeholder` widget type ([src/widgets/placeholder/](src/widgets/placeholder/)) since Phase 4's real widgets don't exist yet — each just needs to add a registry entry the same way

## Phase 4 — Widgets

- [x] 4.1 **Clock widget** — current time/date, large readable typography, no API needed — [src/widgets/clock/ClockWidget.tsx](src/widgets/clock/ClockWidget.tsx), reuses the top bar [Clock.tsx](src/app/Clock.tsx) pattern at widget scale
- [x] 4.2 **Weather widget** — current temp, wind speed, wind direction, sky condition (icon), from SMHI; sync status icon + "last synced" label — [src/widgets/weather/WeatherWidget.tsx](src/widgets/weather/WeatherWidget.tsx), wraps `fetchForecast`/`getCurrentConditions` in `useDataSource`; icon from [src/widgets/shared/weatherIcon.ts](src/widgets/shared/weatherIcon.ts) (emoji stand-in for the Phase 5.3 icon set), compass label from [src/lib/format/compass.ts](src/lib/format/compass.ts)
- [x] 4.3 Weather widget settings — user can choose which fields show and reorder them (drag list in the settings popover; persisted per-widget in config) — [src/widgets/weather/WeatherWidgetSettings.tsx](src/widgets/weather/WeatherWidgetSettings.tsx) (native HTML5 drag-and-drop reorder + visibility checkboxes), schema/parsing in [src/widgets/weather/weatherFields.ts](src/widgets/weather/weatherFields.ts)
- [x] 4.4 **Water widget** — water temperature + name of the source station; sync status + last synced — [src/widgets/water/WaterWidget.tsx](src/widgets/water/WaterWidget.tsx), wraps `fetchNearestWaterTemperature` in `useDataSource`
- [x] 4.5 **Forecast widget** — compact forecast view with a selector for 12h / 24h / 3 days / 1 week; render as a simple horizontal strip (temp + icon per interval), scales down cleanly at small widget sizes — [src/widgets/forecast/ForecastWidget.tsx](src/widgets/forecast/ForecastWidget.tsx), range selector is a live in-widget control (session-only) with the *default* range persisted via [ForecastWidgetSettings.tsx](src/widgets/forecast/ForecastWidgetSettings.tsx)/[forecastRange.ts](src/widgets/forecast/forecastRange.ts); strip is capped/downsampled to ~8 points so it never needs to scroll
- [x] 4.6 **Minimap widget** — Leaflet map centered/zoomed to the configured address, all interaction (drag/zoom/click-to-select) disabled — preview only — [src/widgets/minimap/MinimapWidget.tsx](src/widgets/minimap/MinimapWidget.tsx), plain Leaflet (not react-leaflet, to sidestep React 19 peer-dep churn) with a `ResizeObserver` calling `invalidateSize()` on widget resize; default marker icon path fixed for Vite bundling in [leafletIcons.ts](src/widgets/minimap/leafletIcons.ts); added `leaflet`/`@types/leaflet` deps
- [x] 4.7 Shared widget chrome: consistent card style, status dot (green/yellow/red), last-synced timestamp, loading/error states — status dot + relative "last synced" label factored into [src/widgets/shared/SyncStatusBadge.tsx](src/widgets/shared/SyncStatusBadge.tsx) ([src/lib/format/relativeTime.ts](src/lib/format/relativeTime.ts)), used by Weather/Water/Forecast; missing-address state shared via [src/widgets/shared/MissingAddressNotice.tsx](src/widgets/shared/MissingAddressNotice.tsx) (no address-entry UI exists yet — that's Phase 5.5 — so this is what every location-dependent widget shows until then); card style itself is [WidgetShell.tsx](src/widgets/WidgetShell.tsx) from Phase 3.6

All 5 widgets verified end-to-end in a real browser (Playwright) against live SMHI/OpenStreetMap data for a Stockholm test address: kiosk view, edit-mode chrome (gear/remove), the weather field drag-reorder popover, and the forecast range selector all confirmed working with no console errors.

## Phase 5 — Styling & polish

- [x] 5.1 Define a cohesive visual theme (palette, type scale, spacing) suited to an always-on kitchen display — legible from a few feet away — palette/type/spacing tokens were laid down in [src/index.css](src/index.css) during Phase 0/2; this task added the remaining consistency pass: a shared `--color-surface-hover` token, `:focus-visible` ring for keyboard/switch-control accessibility, and `shadow-2xl` on the modal panels ([DashboardManagerModal.tsx](src/app/DashboardManagerModal.tsx), [WidgetSettingsPanel.tsx](src/app/WidgetSettingsPanel.tsx)) so elevation reads consistently across the app
- [x] 5.2 Optional day/night theme (auto-dim or switch palette based on time of day, since it's always on) — [src/lib/theme/useDayNightTheme.ts](src/lib/theme/useDayNightTheme.ts) sets a `data-theme` attribute (`day` 07:00–20:00 local, else `night`) on `<html>`, re-checked every 5 min; a brighter day palette overrides the night-first tokens via `[data-theme='day']` in [index.css](src/index.css); wired in at [DashboardShell.tsx](src/app/DashboardShell.tsx)
- [x] 5.3 Icon set for weather conditions (sun/cloud/rain/wind etc.) — consistent style across widgets — [src/widgets/shared/WeatherIcon.tsx](src/widgets/shared/WeatherIcon.tsx), a small hand-drawn SVG line-icon set (24x24, shared stroke width, `currentColor`) keyed off the same `WeatherCondition['category']` bucket as before; replaces the emoji stand-in (`weatherIcon.ts`, deleted) in [WeatherWidget.tsx](src/widgets/weather/WeatherWidget.tsx) and [ForecastWidget.tsx](src/widgets/forecast/ForecastWidget.tsx)
- [x] 5.4 Smooth transitions: page swipes, widget status changes, refresh pulses — page swipes already animated in [PageDeck.tsx](src/app/PageDeck.tsx) (Phase 2); this task added a `sync-pulse` keyframe on the [SyncStatusBadge.tsx](src/widgets/shared/SyncStatusBadge.tsx) dot that fires whenever `lastSyncedAt` actually advances (a real refresh landed, not just a re-render), a `transition-colors` on the status dot and [WidgetShell.tsx](src/widgets/WidgetShell.tsx) card for day/night repaints, and a `modal-fade-in` entrance animation shared by all modal panels
- [x] 5.5 Empty/first-run state: guided setup for "enter your address" when no dashboard config exists yet — [src/app/AddressSetupModal.tsx](src/app/AddressSetupModal.tsx), a debounced Nominatim search reusing [geocodeAddress](src/lib/geocode/nominatim.ts); auto-opened once per dashboard with `coords === null` from [DashboardShell.tsx](src/app/DashboardShell.tsx) (a brand-new device always boots into exactly this state per `ensureActiveDashboard`), dismissible via "Skip for now" so it never blocks the kiosk view — widgets keep showing `MissingAddressNotice` until an address is picked
- [x] 5.6 Add option to change and set address for a dashboard. Show the set address in the header. Add button in edit mode to set new address. — same `AddressSetupModal`, reused in "change" mode; [TopBar.tsx](src/app/TopBar.tsx) shows `config.address` next to the dashboard name and, in edit mode only, a "Set address"/"Change address" button that reopens the modal pre-filled with the current address

All Phase 5 changes verified in a real browser (Playwright): fresh device → first-run guided setup with live Nominatim results, seeded dashboard shows the SVG weather icons and address in the header with no first-run modal, edit mode reveals the "Change address" button and reopens the modal correctly, and forcing the browser clock into daytime hours confirmed the day palette (and its transition) actually swaps in via `data-theme`. No console errors in any scenario.

## Phase 6 — Improvements after testing
- [x] 6.1 Add arrow to wind direction together with the text. Add atleast 45 degree resolution. Maybe even tighter if we have that resolution from the API. — [src/widgets/shared/WindArrow.tsx](src/widgets/shared/WindArrow.tsx), rotated by the raw SMHI `windDirectionDeg` (continuous, so finer than the 45° minimum), rendered next to the compass-letter text in [WeatherWidget.tsx](src/widgets/weather/WeatherWidget.tsx)
- [x] 6.2 Add icon to the "Sky" paramter so it does say "Nearly clear sky" in text. — the existing per-condition [WeatherIcon.tsx](src/widgets/shared/WeatherIcon.tsx) is now also rendered inline next to the condition field's text in [WeatherWidget.tsx](src/widgets/weather/WeatherWidget.tsx) (the text description, e.g. "Nearly clear sky", was already there from Phase 4)
- [x] 6.3 Add "byar" to the wind information in the weather widget. To see how varying the winds are. — new `windGust` field in [weatherFields.ts](src/widgets/weather/weatherFields.ts) ("Wind gusts (byar)"), reads `windGustMs` which the SMHI client already parsed but no widget displayed yet
- [x] 6.4 Add some zoom controls to the minimap. — `zoomControl: true` (plus pinch/double-click zoom) in [MinimapWidget.tsx](src/widgets/minimap/MinimapWidget.tsx); panning stays disabled since it's a glance-only preview, not a full map
- [x] 6.5 Minimap mark icon can not be found. It only this empty picture logo. — Leaflet's default marker (PNG assets + CSS-relative paths) was rendering as a broken image under this project's Vite bundling; replaced with an inline-SVG pin via `L.divIcon` in [pinIcon.ts](src/widgets/minimap/pinIcon.ts), in the same hand-drawn line-icon style as the rest of the app. Old `leafletIcons.ts` (the PNG-path fix that didn't work) removed.
- [x] 6.6 shorten the address in the header, now it shifts other content. Shorten it much, might be fine only showing the first name of the address. And if you hover/press it shows the whole address. — `ShortAddress` in [TopBar.tsx](src/app/TopBar.tsx) shows only the first comma-separated segment; native `title` tooltip on hover, tap toggles a small popover with the full address. (Along the way, fixed a pre-existing `overflow-hidden` on the address's parent row that was silently clipping the popover.)
- [x] 6.7 Show on the minimap where the water temperature measuring station is located, so we can see how far away it is. — [MinimapWidget.tsx](src/widgets/minimap/MinimapWidget.tsx) now also calls `fetchNearestWaterTemperature` and plots the station as a second (red) pin with a distance tooltip, auto-fitting the map bounds to include both pins
- [x] 6.8 Add headers to the widgets so you can see and understand what they are. Maybe the option to hide the headers in the settings for each widget. — [WidgetShell.tsx](src/widgets/WidgetShell.tsx)'s title bar now also shows in kiosk mode (not just edit mode) when the widget's `showHeader` setting is on; toggle lives in the generic part of [WidgetSettingsPanel.tsx](src/app/WidgetSettingsPanel.tsx) so every widget type gets it for free
- [x] 6.9 Add refresh button to trigger refresh of all api calls. Maybe in a hidden hamburger menu. — [src/state/refreshBus.ts](src/state/refreshBus.ts) is a tiny pub/sub every `useDataSource` instance subscribes to ([useDataSource.ts](src/lib/dataSource/useDataSource.ts)); "Refresh all now" in the new [HamburgerMenu.tsx](src/app/HamburgerMenu.tsx) (☰ button in [TopBar.tsx](src/app/TopBar.tsx)) fires it
- [x] 6.10 Add refresh interval settings in the hamburgermenu, so you can select to refresh api calls every x minute. Decimal values also allowed. — device-level `refreshIntervalMs` in [src/state/appSettings/](src/state/appSettings/) (persisted to localStorage), editable as decimal minutes in the hamburger menu; every widget's `useDataSource` call now reads it instead of the old hardcoded 60s default
- [x] 6.11 When in edit mode, the formatting of the header gets strange and shiften vertically unexpectedly. Make sure it looks good in edit mode too. — root cause was the header bar having no fixed height, so its height differed slightly between "title only" (kiosk) and "title + gear/remove buttons" (edit); [WidgetShell.tsx](src/widgets/WidgetShell.tsx) now renders a single `h-8` header bar in both modes (edit just adds the buttons to the same bar) instead of two differently-sized bars stacking
- [x] 6.12 Add posibility to add/remove pages in each dashboard. Now there are always 2, but make it possible to add more and remove them. — `addPage`/`removePage` on the dashboard config context ([context.ts](src/state/dashboardConfig/context.ts)/[DashboardConfigProvider.tsx](src/state/dashboardConfig/DashboardConfigProvider.tsx)); "− Page"/"+ Page" controls in [PageIndicator.tsx](src/app/PageIndicator.tsx) (edit mode only, always keeps at least 1 page); [pageNav.ts](src/state/pageNav.ts) now re-clamps the current page if the page count shrinks out from under it
- [x] 6.13 When in edit mode and the header is showing for the widget, the content gets shiften downwards and does not look so good when we see half of some text. Make sure that even if the header is shown for a widget, the content is still fully visible. — same [WidgetShell.tsx](src/widgets/WidgetShell.tsx) fix as 6.11: the content pane is always `min-h-0 flex-1 overflow-hidden` below a fixed-height header, so it's given exactly the remaining space rather than overlapping/clipping
- [x] 6.14 Add dark and light mode. Create a toggle in the hamburger menu to change between the different visualization modes. — the Phase 5.2 time-of-day auto-theme is now one of three modes (Auto/Light/Dark) in [src/state/appSettings/](src/state/appSettings/), selectable in the hamburger menu; Light/Dark map directly onto the existing day/night palette in [index.css](src/index.css)

All Phase 6 changes verified in a real browser (Playwright) against live SMHI/ocobs/OpenStreetMap data: wind arrow + gusts + sky icon rendering correctly, minimap showing both address and water-station pins as proper SVG icons with working zoom controls, shortened address with a working tap-to-expand popover, widget headers appearing in kiosk mode and toggling off correctly, the hamburger menu's refresh-all/interval/theme controls all working and persisting to localStorage, edit-mode header layout unchanged in height whether or not gear/remove buttons are showing, and page add/remove (including re-clamping the current page) all working with no console errors.

## Phase 7 — iPad deployment

- [ ] 6.1 Deploy to chosen static host, confirm stable URL
- [ ] 6.2 On iPad: open URL in Safari → Add to Home Screen → verify fullscreen standalone launch
- [ ] 6.3 Configure iPad Settings: Auto-Lock → Never (or Guided Access pinned to the dashboard) so the display stays on
- [ ] 6.4 End-to-end test: fresh dashboard creation, address entry, widget placement, save/rename/duplicate/delete, page switching, forced refresh, and a simulated API failure (airplane mode) to confirm status indicators behave correctly

## Phase 8 — Future: boat traffic on the minimap

- [ ] 7.1 Prototype `aisstream.io` WebSocket feed filtered to a bounding box around the configured address
- [ ] 7.2 Plot live vessel positions as pressable markers on the minimap
- [ ] 7.3 Marker tap → popover with vessel stats (name, type, speed, heading, destination if available)
- [ ] 7.4 Decide whether the API key exposure (client-side, static site) is acceptable long-term or warrants a minimal proxy at that point

---

## Open decisions to make along the way

- Exact address/coordinates to center the dashboard on (entered during first-run setup, Phase 5.5)
- Visual theme direction (light/dark/auto, color palette) — can be a quick style exploration once Phase 0 scaffolding is in place
- Whether 1 page or multiple pages are needed for launch, and what lives on page 2+
