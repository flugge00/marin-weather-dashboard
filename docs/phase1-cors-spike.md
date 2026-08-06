# Phase 1.1 — CORS spike results

Verified 2026-08-05 with direct `curl -H "Origin: http://localhost:5173"` requests
against each endpoint (checking for `Access-Control-Allow-Origin` on the actual
response, not just a preflight). All three data sources the dashboard needs are
browser-fetchable with no proxy required.

## 1. SMHI forecast — ⚠️ plan needed updating

The endpoint documented in `PLAN.md` (`category/pmp3g/version/2/...`) was
**deprecated by SMHI on 2026-03-31** and now returns 404. It has been replaced by
`snow1g` version `1`. `PLAN.md` has been updated to point at the new endpoint.

```
GET https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/{lon}/lat/{lat}/data.json
```

- CORS: confirmed — response includes `Access-Control-Allow-Origin: *`.
- Response shape is flatter than the old `pmp3g` format (no more
  `parameters: [{ name, values: [...] }]` arrays):

  ```json
  {
    "createdTime": "2026-08-05T19:03:26Z",
    "referenceTime": "2026-08-05T18:45:00Z",
    "geometry": { "type": "Point", "coordinates": [18.077207, 59.33036] },
    "timeSeries": [
      {
        "time": "2026-08-05T19:00:00Z",
        "data": {
          "air_temperature": 20.1,
          "wind_from_direction": 189,
          "wind_speed": 3.0,
          "wind_speed_of_gust": 5.7,
          "relative_humidity": 66,
          "cloud_area_fraction": 8,
          "probability_of_precipitation": 0,
          "symbol_code": 6
        }
      }
    ]
  }
  ```

- `symbol_code` uses the same 1–27 scale as the old `Wsymb2` parameter (SMHI's
  standard weather-symbol table), so the existing symbol → condition mapping
  concept still applies.
- Coordinates should be rounded to ~6 decimals; the API snaps to its nearest
  grid point and echoes the actual grid-point coordinates back in `geometry`.

## 2. SMHI ocobs (water temperature)

Rather than the per-station `.../station/{id}/period/{period}/data.json` route
(which 404s for most stations — many only expose `corrected-archive`, not
`latest-hour`), the reliable route is the **all-active-stations** feed for the
water temperature parameter (`5` = Havstemperatur):

```
GET https://opendata-download-ocobs.smhi.se/api/version/1.0/parameter/5/station-set/all/period/latest-day/data.json
```

Use `latest-day`, not `latest-hour`, for the period. `latest-hour` only
includes stations that reported in the literal last hour, which in practice
is a handful of offshore SMHI buoys nationwide (~7 stations) — most coastal
stations (municipal `SJÖV` stations, and even SMHI ones like `ARKÖ`) report a
few times a day rather than every hour and never appear in it, even though
they're `active` with data through today. `latest-day` returns ~45-50
stations instead of ~7, so "nearest station" lookups actually find the
nearest station rather than whichever handful of buoys happened to report
in the last hour.

- CORS: confirmed — `Access-Control-Allow-Origin: *`.
- Returns every currently-reporting station in one response, each with
  structured `latitude`/`longitude` (no need to regex-parse a `summary`
  string) and one or more `value` readings (one per depth, `depth: "0"` being
  the surface reading):

  ```json
  {
    "station": [
      {
        "key": "33084",
        "name": "ONSALA",
        "latitude": 57.392,
        "longitude": 11.919,
        "value": [{ "date": 1785952800000, "value": 20.01, "depth": "0" }]
      }
    ]
  }
  ```

- Nearest-station lookup is therefore: fetch this one file, haversine-distance
  every station against the configured lat/lon, pick the closest one that has
  a `depth: "0"` (or shallowest) reading.
- Note: some stations (e.g. Sjöfartsverket "ferrybox" buoys) are mobile —
  their lat/lon is a live position, not a fixed mooring. Not filtered out for
  now since they still report a legitimate nearby reading; worth revisiting
  if a mobile station ever "wins" nearest-station in an unexpected spot.

## 3. Nominatim geocoding

```
GET https://nominatim.openstreetmap.org/search?q={query}&format=jsonv2&limit=1
```

- CORS: confirmed — `Access-Control-Allow-Origin: *`.
- Usage policy requires an identifying `User-Agent` and a max of 1 request/sec
  — both fine for the one-time "enter your address" setup flow this is used
  for (task 1.6).

## Conclusion

No CORS blockers, no proxy/serverless fallback needed for any of the three
data sources. The one required action was updating `PLAN.md`'s SMHI forecast
URL from the deprecated `pmp3g` endpoint to `snow1g`.
