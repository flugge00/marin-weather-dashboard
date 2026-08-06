import type { VesselCategory } from '../../lib/ais/shipType'
import type { TranslationKey } from '../../state/locale/translations'

/** Shared by the settings checklist and the vessel popover (Phase 8). */
export const VESSEL_CATEGORY_LABEL_KEY: Record<VesselCategory, TranslationKey> =
  {
    cargo: 'minimapSettings.vesselCategory.cargo',
    tanker: 'minimapSettings.vesselCategory.tanker',
    passenger: 'minimapSettings.vesselCategory.passenger',
    fishing: 'minimapSettings.vesselCategory.fishing',
    pleasure: 'minimapSettings.vesselCategory.pleasure',
    highSpeed: 'minimapSettings.vesselCategory.highSpeed',
    other: 'minimapSettings.vesselCategory.other',
  }
