export type Locale = 'en' | 'sv'

export const LOCALES: { key: Locale; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'sv', label: 'Svenska' },
]

/**
 * Flat, dot-namespaced translation keys shared by every UI string in the
 * app. `t()` (see context.ts) does `{{var}}` interpolation against these.
 */
export const translations = {
  en: {
    // TopBar
    'topBar.changeAddress': 'Change address',
    'topBar.setAddress': 'Set address',
    'topBar.dashboards': 'Dashboards',
    'topBar.done': 'Done',
    'topBar.edit': 'Edit',
    'topBar.online': 'Online',
    'topBar.offline': 'Offline',

    // HamburgerMenu
    'hamburger.settingsMenu': 'Settings menu',
    'hamburger.refreshAllNow': 'Refresh all now',
    'hamburger.refreshInterval': 'Refresh interval (minutes)',
    'hamburger.appearance': 'Appearance',
    'hamburger.theme.auto': 'Auto (day/night)',
    'hamburger.theme.light': 'Light',
    'hamburger.theme.dark': 'Dark',
    'hamburger.language': 'Language',
    'hamburger.aisApiKey': 'Boat traffic (AIS) API key',
    'hamburger.aisApiKeyPlaceholder': 'aisstream.io API key',
    'hamburger.aisApiKeyHint':
      'Free key from aisstream.io. Stored only on this device, never included in dashboard export.',

    // AddWidgetMenu
    'addWidget.close': 'Close',
    'addWidget.addWidget': '+ Add widget',

    // AddressSetupModal
    'addressSetup.titleFirstRun': 'Where is this dashboard about?',
    'addressSetup.titleChange': 'Change address',
    'addressSetup.descriptionFirstRun':
      'Search for an address to enable weather, water temperature, forecast, and the minimap.',
    'addressSetup.descriptionChange':
      'Search for a new address to re-center all location-based widgets.',
    'addressSetup.placeholder': 'Street, city, or place name',
    'addressSetup.searching': 'Searching…',
    'addressSetup.searchError': 'Could not search for that address. Try again.',
    'addressSetup.noMatches': 'No matches. Try a more specific address.',
    'addressSetup.skipForNow': 'Skip for now',
    'addressSetup.cancel': 'Cancel',

    // DashboardManagerModal
    'dashboardManager.title': 'Dashboards',
    'dashboardManager.duplicate': 'Duplicate',
    'dashboardManager.duplicateAria': 'Duplicate {{name}}',
    'dashboardManager.delete': 'Delete',
    'dashboardManager.deleteAria': 'Delete {{name}}',
    'dashboardManager.activeDashboardName': 'Active dashboard name',
    'dashboardManager.rename': 'Rename',
    'dashboardManager.createNewDashboard': 'Create new dashboard',
    'dashboardManager.dashboardNamePlaceholder': 'Dashboard name',
    'dashboardManager.create': 'Create',
    'dashboardManager.exportJson': 'Export JSON',
    'dashboardManager.importJson': 'Import JSON',
    'dashboardManager.importErrorInvalid':
      'That file is not a valid dashboard config.',
    'dashboardManager.importErrorParse': 'Could not read that file as JSON.',
    'dashboardManager.close': 'Close',

    // PageIndicator
    'pageIndicator.removeCurrentPage': 'Remove current page',
    'pageIndicator.removePage': '− Page',
    'pageIndicator.addPage': '+ Page',
    'pageIndicator.goToPage': 'Go to page {{n}}',

    // PageDeck
    'pageDeck.previousPage': 'Previous page',
    'pageDeck.nextPage': 'Next page',

    // WidgetShell
    'widgetShell.settingsAria': '{{title}} settings',
    'widgetShell.removeAria': 'Remove {{title}}',

    // WidgetSettingsPanel
    'widgetSettings.titleSuffix': '{{title}} settings',
    'widgetSettings.showHeader': 'Show widget header',
    'widgetSettings.contentScale': 'Content scale',
    'widgetSettings.noSettings': 'This widget has no configurable settings.',
    'widgetSettings.cancel': 'Cancel',
    'widgetSettings.save': 'Save',

    // Widget display names (registry)
    'widget.clock': 'Clock',
    'widget.weather': 'Weather',
    'widget.water': 'Water temperature',
    'widget.forecast': 'Forecast',
    'widget.minimap': 'Minimap',
    'widget.rain': 'Rain risk',
    'widget.sealevel': 'Sea level',
    'widget.wave': 'Waves',
    'widget.pressure': 'Air pressure',
    'widget.warnings': 'Weather warnings',

    // MissingAddressNotice
    'missingAddress.notice':
      'Set an address for this dashboard to enable this widget.',

    // SyncStatusBadge
    'syncStatus.synced': 'Synced',
    'syncStatus.stale': 'Stale',
    'syncStatus.error': 'Error',
    'syncStatus.syncing': 'Syncing…',

    // WaterWidget
    'water.unableToLoad': 'Unable to load water temperature.',
    'water.noStations': 'No stations currently reporting.',
    'water.loading': 'Loading…',

    // WeatherWidget
    'weather.unableToLoad': 'Unable to load weather.',
    'weather.loading': 'Loading…',
    'weather.field.temperature': 'Temp',
    'weather.field.wind': 'Wind',
    'weather.field.windGust': 'Gusts',
    'weather.field.windDirection': 'Direction',
    'weather.field.condition': 'Sky',

    // WeatherWidgetSettings
    'weatherSettings.dragToReorder': 'Drag to reorder, check to show',

    // ForecastWidget
    'forecast.unableToLoad': 'Unable to load forecast.',
    'forecast.loading': 'Loading…',

    // RainWidget
    'rain.unableToLoad': 'Unable to load rain forecast.',
    'rain.loading': 'Loading…',

    // SeaLevelWidget
    'sealevel.unableToLoad': 'Unable to load sea level.',
    'sealevel.noStations': 'No stations currently reporting.',
    'sealevel.loading': 'Loading…',
    'sealevel.trend': '{{value}} cm/h',

    // WaveWidget
    'wave.unableToLoad': 'Unable to load wave data.',
    'wave.noStations': 'No buoys currently reporting.',
    'wave.loading': 'Loading…',
    'wave.height': 'Height',
    'wave.period': 'Period',

    // PressureWidget
    'pressure.unableToLoad': 'Unable to load air pressure.',
    'pressure.noStations': 'No stations currently reporting.',
    'pressure.loading': 'Loading…',
    'pressure.trend': '{{value}} hPa/3h',

    // WarningsWidget
    'warnings.unableToLoad': 'Unable to load weather warnings.',
    'warnings.loading': 'Loading…',
    'warnings.none': 'No active warnings for this area.',

    // ForecastWidgetSettings
    'forecastSettings.defaultRange': 'Default range',

    // MinimapWidget / MinimapWidgetSettings
    'minimap.resetView': 'Reset view',
    'minimapSettings.showStationPin': 'Show water station pin',
    'minimapSettings.pinSize': 'Pin size',
    'minimapSettings.showBoatTraffic': 'Show boat traffic (AIS)',
    'minimapSettings.showBoatTrafficHint':
      "Needs an AIS API key, set in the hamburger menu. We can't reliably fetch all traffic, only a close, adjustable area around your address.",
    'minimapSettings.boatTrafficRadius': 'Boat traffic radius: {{km}} km',
    'minimapSettings.showBoatTrafficRadiusCircle': 'Show radius on map',
    'minimapSettings.vesselIconSize': 'Vessel marker size',
    'minimapSettings.vesselCategories': 'Vessel types to show',
    'minimapSettings.vesselCategory.cargo': 'Cargo',
    'minimapSettings.vesselCategory.tanker': 'Tanker',
    'minimapSettings.vesselCategory.passenger': 'Passenger',
    'minimapSettings.vesselCategory.fishing': 'Fishing',
    'minimapSettings.vesselCategory.pleasure': 'Pleasure craft',
    'minimapSettings.vesselCategory.highSpeed': 'High-speed craft',
    'minimapSettings.vesselCategory.other': 'Other',

    // AisStatusBadge
    'ais.status.idle': 'AIS: idle',
    'ais.status.noKey': 'AIS: no API key',
    'ais.status.connecting': 'AIS: connecting…',
    'ais.status.live': 'AIS: live',
    'ais.status.error': 'AIS: reconnecting…',

    // Vessel popover (minimap boat traffic)
    'vessel.type': 'Type',
    'vessel.speed': 'Speed',
    'vessel.heading': 'Heading',
    'vessel.destination': 'Destination',
    'vessel.speedValue': '{{knots}} kn',

    // WeatherWidgetSettings field meta labels (long form)
    'weatherFieldMeta.temperature': 'Temperature',
    'weatherFieldMeta.wind': 'Wind speed',
    'weatherFieldMeta.windGust': 'Wind gusts (byar)',
    'weatherFieldMeta.windDirection': 'Wind direction',
    'weatherFieldMeta.condition': 'Sky condition',

    // relativeTime
    'relativeTime.justNow': 'just now',
    'relativeTime.secondsAgo': '{{n}}s ago',
    'relativeTime.minutesAgo': '{{n}}m ago',
    'relativeTime.hoursAgo': '{{n}}h ago',
    'relativeTime.daysAgo': '{{n}}d ago',

    // weatherSymbol descriptions (SMHI Wsymb2 codes 1-27)
    'weatherSymbol.1': 'Clear sky',
    'weatherSymbol.2': 'Nearly clear sky',
    'weatherSymbol.3': 'Variable cloudiness',
    'weatherSymbol.4': 'Halfclear sky',
    'weatherSymbol.5': 'Cloudy sky',
    'weatherSymbol.6': 'Overcast',
    'weatherSymbol.7': 'Fog',
    'weatherSymbol.8': 'Light rain showers',
    'weatherSymbol.9': 'Moderate rain showers',
    'weatherSymbol.10': 'Heavy rain showers',
    'weatherSymbol.11': 'Thunderstorm',
    'weatherSymbol.12': 'Light sleet showers',
    'weatherSymbol.13': 'Moderate sleet showers',
    'weatherSymbol.14': 'Heavy sleet showers',
    'weatherSymbol.15': 'Light snow showers',
    'weatherSymbol.16': 'Moderate snow showers',
    'weatherSymbol.17': 'Heavy snow showers',
    'weatherSymbol.18': 'Light rain',
    'weatherSymbol.19': 'Moderate rain',
    'weatherSymbol.20': 'Heavy rain',
    'weatherSymbol.21': 'Thunder',
    'weatherSymbol.22': 'Light sleet',
    'weatherSymbol.23': 'Moderate sleet',
    'weatherSymbol.24': 'Heavy sleet',
    'weatherSymbol.25': 'Light snowfall',
    'weatherSymbol.26': 'Moderate snowfall',
    'weatherSymbol.27': 'Heavy snowfall',
  },
  sv: {
    // TopBar
    'topBar.changeAddress': 'Byt adress',
    'topBar.setAddress': 'Ange adress',
    'topBar.dashboards': 'Instrumentpaneler',
    'topBar.done': 'Klar',
    'topBar.edit': 'Redigera',
    'topBar.online': 'Online',
    'topBar.offline': 'Offline',

    // HamburgerMenu
    'hamburger.settingsMenu': 'Inställningsmeny',
    'hamburger.refreshAllNow': 'Uppdatera allt nu',
    'hamburger.refreshInterval': 'Uppdateringsintervall (minuter)',
    'hamburger.appearance': 'Utseende',
    'hamburger.theme.auto': 'Auto (dag/natt)',
    'hamburger.theme.light': 'Ljust',
    'hamburger.theme.dark': 'Mörkt',
    'hamburger.language': 'Språk',
    'hamburger.aisApiKey': 'API-nyckel för båttrafik (AIS)',
    'hamburger.aisApiKeyPlaceholder': 'API-nyckel från aisstream.io',
    'hamburger.aisApiKeyHint':
      'Gratis nyckel från aisstream.io. Sparas endast på den här enheten, ingår aldrig i exporterad instrumentpanel.',

    // AddWidgetMenu
    'addWidget.close': 'Stäng',
    'addWidget.addWidget': '+ Lägg till widget',

    // AddressSetupModal
    'addressSetup.titleFirstRun': 'Vad handlar den här instrumentpanelen om?',
    'addressSetup.titleChange': 'Byt adress',
    'addressSetup.descriptionFirstRun':
      'Sök efter en adress för att aktivera väder, vattentemperatur, prognos och minikartan.',
    'addressSetup.descriptionChange':
      'Sök efter en ny adress för att centrera om alla platsbaserade widgetar.',
    'addressSetup.placeholder': 'Gata, ort eller plats',
    'addressSetup.searching': 'Söker…',
    'addressSetup.searchError':
      'Kunde inte söka efter den adressen. Försök igen.',
    'addressSetup.noMatches':
      'Inga träffar. Försök med en mer specifik adress.',
    'addressSetup.skipForNow': 'Hoppa över för nu',
    'addressSetup.cancel': 'Avbryt',

    // DashboardManagerModal
    'dashboardManager.title': 'Instrumentpaneler',
    'dashboardManager.duplicate': 'Duplicera',
    'dashboardManager.duplicateAria': 'Duplicera {{name}}',
    'dashboardManager.delete': 'Ta bort',
    'dashboardManager.deleteAria': 'Ta bort {{name}}',
    'dashboardManager.activeDashboardName': 'Aktiv instrumentpanels namn',
    'dashboardManager.rename': 'Byt namn',
    'dashboardManager.createNewDashboard': 'Skapa ny instrumentpanel',
    'dashboardManager.dashboardNamePlaceholder': 'Namn på instrumentpanel',
    'dashboardManager.create': 'Skapa',
    'dashboardManager.exportJson': 'Exportera JSON',
    'dashboardManager.importJson': 'Importera JSON',
    'dashboardManager.importErrorInvalid':
      'Den filen är inte en giltig instrumentpanelskonfiguration.',
    'dashboardManager.importErrorParse': 'Kunde inte läsa filen som JSON.',
    'dashboardManager.close': 'Stäng',

    // PageIndicator
    'pageIndicator.removeCurrentPage': 'Ta bort aktuell sida',
    'pageIndicator.removePage': '− Sida',
    'pageIndicator.addPage': '+ Sida',
    'pageIndicator.goToPage': 'Gå till sida {{n}}',

    // PageDeck
    'pageDeck.previousPage': 'Föregående sida',
    'pageDeck.nextPage': 'Nästa sida',

    // WidgetShell
    'widgetShell.settingsAria': 'Inställningar för {{title}}',
    'widgetShell.removeAria': 'Ta bort {{title}}',

    // WidgetSettingsPanel
    'widgetSettings.titleSuffix': 'Inställningar för {{title}}',
    'widgetSettings.showHeader': 'Visa widgetens rubrik',
    'widgetSettings.contentScale': 'Innehållsskala',
    'widgetSettings.noSettings': 'Den här widgeten har inga inställningar.',
    'widgetSettings.cancel': 'Avbryt',
    'widgetSettings.save': 'Spara',

    // Widget display names (registry)
    'widget.clock': 'Klocka',
    'widget.weather': 'Väder',
    'widget.water': 'Vattentemperatur',
    'widget.forecast': 'Prognos',
    'widget.minimap': 'Minikarta',
    'widget.rain': 'Regnrisk',
    'widget.sealevel': 'Havsvattenstånd',
    'widget.wave': 'Vågor',
    'widget.pressure': 'Lufttryck',
    'widget.warnings': 'Vädervarningar',

    // MissingAddressNotice
    'missingAddress.notice':
      'Ange en adress för den här instrumentpanelen för att aktivera widgeten.',

    // SyncStatusBadge
    'syncStatus.synced': 'Synkad',
    'syncStatus.stale': 'Inaktuell',
    'syncStatus.error': 'Fel',
    'syncStatus.syncing': 'Synkar…',

    // WaterWidget
    'water.unableToLoad': 'Kunde inte hämta vattentemperatur.',
    'water.noStations': 'Inga stationer rapporterar just nu.',
    'water.loading': 'Laddar…',

    // WeatherWidget
    'weather.unableToLoad': 'Kunde inte hämta väder.',
    'weather.loading': 'Laddar…',
    'weather.field.temperature': 'Temp',
    'weather.field.wind': 'Vind',
    'weather.field.windGust': 'Byar',
    'weather.field.windDirection': 'Riktning',
    'weather.field.condition': 'Himmel',

    // WeatherWidgetSettings
    'weatherSettings.dragToReorder':
      'Dra för att ändra ordning, kryssa för att visa',

    // ForecastWidget
    'forecast.unableToLoad': 'Kunde inte hämta prognos.',
    'forecast.loading': 'Laddar…',

    // RainWidget
    'rain.unableToLoad': 'Kunde inte hämta regnprognos.',
    'rain.loading': 'Laddar…',

    // SeaLevelWidget
    'sealevel.unableToLoad': 'Kunde inte hämta havsvattenstånd.',
    'sealevel.noStations': 'Inga stationer rapporterar just nu.',
    'sealevel.loading': 'Laddar…',
    'sealevel.trend': '{{value}} cm/h',

    // WaveWidget
    'wave.unableToLoad': 'Kunde inte hämta vågdata.',
    'wave.noStations': 'Inga bojar rapporterar just nu.',
    'wave.loading': 'Laddar…',
    'wave.height': 'Höjd',
    'wave.period': 'Period',

    // PressureWidget
    'pressure.unableToLoad': 'Kunde inte hämta lufttryck.',
    'pressure.noStations': 'Inga stationer rapporterar just nu.',
    'pressure.loading': 'Laddar…',
    'pressure.trend': '{{value}} hPa/3h',

    // WarningsWidget
    'warnings.unableToLoad': 'Kunde inte hämta vädervarningar.',
    'warnings.loading': 'Laddar…',
    'warnings.none': 'Inga aktiva varningar för det här området.',

    // ForecastWidgetSettings
    'forecastSettings.defaultRange': 'Standardintervall',

    // MinimapWidget / MinimapWidgetSettings
    'minimap.resetView': 'Återställ vy',
    'minimapSettings.showStationPin': 'Visa markör för vattenstation',
    'minimapSettings.pinSize': 'Markörstorlek',
    'minimapSettings.showBoatTraffic': 'Visa båttrafik (AIS)',
    'minimapSettings.showBoatTrafficHint':
      'Kräver en AIS-API-nyckel, anges i hamburgarmenyn. Vi kan inte hämta all trafik tillförlitligt, bara ett nära, justerbart område runt din adress.',
    'minimapSettings.boatTrafficRadius': 'Radie för båttrafik: {{km}} km',
    'minimapSettings.showBoatTrafficRadiusCircle': 'Visa radie på kartan',
    'minimapSettings.vesselIconSize': 'Storlek på fartygsmarkör',
    'minimapSettings.vesselCategories': 'Fartygstyper att visa',
    'minimapSettings.vesselCategory.cargo': 'Lastfartyg',
    'minimapSettings.vesselCategory.tanker': 'Tankfartyg',
    'minimapSettings.vesselCategory.passenger': 'Passagerarfartyg',
    'minimapSettings.vesselCategory.fishing': 'Fiskebåt',
    'minimapSettings.vesselCategory.pleasure': 'Fritidsbåt',
    'minimapSettings.vesselCategory.highSpeed': 'Höghastighetsfartyg',
    'minimapSettings.vesselCategory.other': 'Övrigt',

    // AisStatusBadge
    'ais.status.idle': 'AIS: inaktiv',
    'ais.status.noKey': 'AIS: ingen API-nyckel',
    'ais.status.connecting': 'AIS: ansluter…',
    'ais.status.live': 'AIS: live',
    'ais.status.error': 'AIS: återansluter…',

    // Vessel popover (minimap boat traffic)
    'vessel.type': 'Typ',
    'vessel.speed': 'Fart',
    'vessel.heading': 'Kurs',
    'vessel.destination': 'Destination',
    'vessel.speedValue': '{{knots}} kn',

    // WeatherWidgetSettings field meta labels (long form)
    'weatherFieldMeta.temperature': 'Temperatur',
    'weatherFieldMeta.wind': 'Vindhastighet',
    'weatherFieldMeta.windGust': 'Vindbyar',
    'weatherFieldMeta.windDirection': 'Vindriktning',
    'weatherFieldMeta.condition': 'Väderlek',

    // relativeTime
    'relativeTime.justNow': 'just nu',
    'relativeTime.secondsAgo': '{{n}}s sedan',
    'relativeTime.minutesAgo': '{{n}}m sedan',
    'relativeTime.hoursAgo': '{{n}}t sedan',
    'relativeTime.daysAgo': '{{n}}d sedan',

    // weatherSymbol descriptions (SMHI Wsymb2 codes 1-27)
    'weatherSymbol.1': 'Klart',
    'weatherSymbol.2': 'Mest klart',
    'weatherSymbol.3': 'Växlande molnighet',
    'weatherSymbol.4': 'Halvklart',
    'weatherSymbol.5': 'Molnigt',
    'weatherSymbol.6': 'Mulet',
    'weatherSymbol.7': 'Dimma',
    'weatherSymbol.8': 'Lätta regnskurar',
    'weatherSymbol.9': 'Måttliga regnskurar',
    'weatherSymbol.10': 'Kraftiga regnskurar',
    'weatherSymbol.11': 'Åska',
    'weatherSymbol.12': 'Lätta snöblandade skurar',
    'weatherSymbol.13': 'Måttliga snöblandade skurar',
    'weatherSymbol.14': 'Kraftiga snöblandade skurar',
    'weatherSymbol.15': 'Lätta snöbyar',
    'weatherSymbol.16': 'Måttliga snöbyar',
    'weatherSymbol.17': 'Kraftiga snöbyar',
    'weatherSymbol.18': 'Lätt regn',
    'weatherSymbol.19': 'Måttligt regn',
    'weatherSymbol.20': 'Kraftigt regn',
    'weatherSymbol.21': 'Åskväder',
    'weatherSymbol.22': 'Lätt snöblandat regn',
    'weatherSymbol.23': 'Måttligt snöblandat regn',
    'weatherSymbol.24': 'Kraftigt snöblandat regn',
    'weatherSymbol.25': 'Lätt snöfall',
    'weatherSymbol.26': 'Måttligt snöfall',
    'weatherSymbol.27': 'Kraftigt snöfall',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type TranslationKey = keyof (typeof translations)['en']

/** Registry widget `type` strings map 1:1 to `widget.<type>` translation keys. */
export function widgetNameKey(type: string): TranslationKey {
  return `widget.${type}` as TranslationKey
}

/** SMHI weather-symbol codes (1-27) map 1:1 to `weatherSymbol.<code>` translation keys. */
export function weatherSymbolKey(code: number): TranslationKey {
  return `weatherSymbol.${code}` as TranslationKey
}

/** WeatherFieldKey values map 1:1 to `weatherFieldMeta.<key>` translation keys. */
export function weatherFieldMetaKey(key: string): TranslationKey {
  return `weatherFieldMeta.${key}` as TranslationKey
}
