export interface WidgetSettingsProps<TSettings = Record<string, unknown>> {
  settings: TSettings
  onChange: (settings: TSettings) => void
}
