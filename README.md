# Marin Weather Dashboard

A customizable weather and marine-conditions dashboard for a boat address (or any address) on the Swedish coast, built on public [SMHI](https://opendata.smhi.se) data. Designed as a wall/tablet display: drag-and-drop widget grid, day/night auto-theme, and English/Swedish language support.

**Live site:** https://flugge00.github.io/marin-weather-dashboard/

## Features

- Drag-and-resize widget grid with multiple pages, saved to local storage
- Widgets: Clock, Weather, Forecast, Rain risk, Water temperature, Sea level, Waves, Air pressure, Weather warnings, Minimap
- Address setup with geocoding, so widgets pull data for a specific location
- Auto light/dark theme based on time of day
- English/Swedish language switcher
- Works offline-ish as a PWA (installable, cached shell)

## Running locally

Requires [Node.js](https://nodejs.org/).

```bash
npm install
npm run dev
```

This starts a local dev server (Vite) with hot reload, printed to the terminal.

Other scripts:

```bash
npm run build         # type-check and build for production (outputs to dist/)
npm run preview       # preview the production build locally
npm run lint          # run ESLint
npm run format         # format with Prettier
npm run format:check   # check formatting without writing
```

## Deployment

Pushing to `main` deploys automatically to GitHub Pages via the GitHub Actions workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
