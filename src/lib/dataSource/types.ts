export type SyncStatus = 'ok' | 'stale' | 'error'

export interface DataSourceState<T> {
  data: T | null
  status: SyncStatus
  loading: boolean
  lastSyncedAt: number | null
  lastError: string | null
}
