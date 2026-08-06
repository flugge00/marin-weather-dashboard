import { VESSEL_CATEGORIES, type VesselCategory } from '../../lib/ais/shipType'
import { useLocale } from '../../state/locale/context'
import type { WidgetSettingsProps } from '../types'
import {
  MAX_BOAT_TRAFFIC_RADIUS_KM,
  MAX_PIN_SIZE_PX,
  MAX_VESSEL_ICON_SIZE_PX,
  MIN_BOAT_TRAFFIC_RADIUS_KM,
  MIN_PIN_SIZE_PX,
  MIN_VESSEL_ICON_SIZE_PX,
  readMinimapSettings,
} from './minimapSettings'
import { VESSEL_CATEGORY_LABEL_KEY } from './vesselCategoryLabels'

/**
 * Lets the user toggle the water-station pin, resize pins (task 6.1.6), and
 * configure the live boat-traffic overlay (Phase 8): on/off, how large an
 * area around the address to fetch/show (we can't reliably fetch *all* AIS
 * traffic, only a close adjustable proximity), which vessel categories to
 * include, and the marker size.
 */
export function MinimapWidgetSettings({
  settings,
  onChange,
}: WidgetSettingsProps) {
  const { t } = useLocale()
  const {
    showStationPin,
    pinSizePx,
    showBoatTraffic,
    boatTrafficRadiusKm,
    showBoatTrafficRadiusCircle,
    vesselCategories,
    vesselIconSizePx,
  } = readMinimapSettings(settings)

  const toggleCategory = (category: VesselCategory) => {
    const next = vesselCategories.includes(category)
      ? vesselCategories.filter((c) => c !== category)
      : [...vesselCategories, category]
    onChange({ ...settings, vesselCategories: next })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showStationPin}
          onChange={(event) =>
            onChange({ ...settings, showStationPin: event.target.checked })
          }
        />
        {t('minimapSettings.showStationPin')}
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-surface-muted">
          {t('minimapSettings.pinSize')}
        </span>
        <input
          type="range"
          min={MIN_PIN_SIZE_PX}
          max={MAX_PIN_SIZE_PX}
          step={1}
          value={pinSizePx}
          onChange={(event) =>
            onChange({ ...settings, pinSizePx: Number(event.target.value) })
          }
          className="w-full"
        />
      </label>

      <hr className="border-surface-border" />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showBoatTraffic}
          onChange={(event) =>
            onChange({ ...settings, showBoatTraffic: event.target.checked })
          }
        />
        {t('minimapSettings.showBoatTraffic')}
      </label>
      <p className="-mt-2 text-xs text-surface-muted">
        {t('minimapSettings.showBoatTrafficHint')}
      </p>

      {showBoatTraffic && (
        <>
          <label className="block text-sm">
            <span className="mb-1 block text-surface-muted">
              {t('minimapSettings.boatTrafficRadius', {
                km: boatTrafficRadiusKm,
              })}
            </span>
            <input
              type="range"
              min={MIN_BOAT_TRAFFIC_RADIUS_KM}
              max={MAX_BOAT_TRAFFIC_RADIUS_KM}
              step={1}
              value={boatTrafficRadiusKm}
              onChange={(event) =>
                onChange({
                  ...settings,
                  boatTrafficRadiusKm: Number(event.target.value),
                })
              }
              className="w-full"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showBoatTrafficRadiusCircle}
              onChange={(event) =>
                onChange({
                  ...settings,
                  showBoatTrafficRadiusCircle: event.target.checked,
                })
              }
            />
            {t('minimapSettings.showBoatTrafficRadiusCircle')}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-surface-muted">
              {t('minimapSettings.vesselIconSize')}
            </span>
            <input
              type="range"
              min={MIN_VESSEL_ICON_SIZE_PX}
              max={MAX_VESSEL_ICON_SIZE_PX}
              step={1}
              value={vesselIconSizePx}
              onChange={(event) =>
                onChange({
                  ...settings,
                  vesselIconSizePx: Number(event.target.value),
                })
              }
              className="w-full"
            />
          </label>

          <div className="text-sm">
            <span className="mb-1 block text-surface-muted">
              {t('minimapSettings.vesselCategories')}
            </span>
            <div className="grid grid-cols-2 gap-1">
              {VESSEL_CATEGORIES.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={vesselCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  {t(VESSEL_CATEGORY_LABEL_KEY[category])}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
