import { request } from '../request'
import { Endpoints } from '../endpoints'
import type { DataVersionMeta, FeatureFlags } from '@/types/api'

export interface ChangelogItem {
  version: string
  publishedAt: string
  changes: { type: string; target: string; name: string; note?: string }[]
}

export const metaService = {
  dataVersion(): Promise<DataVersionMeta> {
    return request.get<DataVersionMeta>(Endpoints.metaDataVersion)
  },

  changelog(limit = 10): Promise<{ list: ChangelogItem[] }> {
    return request.get<{ list: ChangelogItem[] }>(Endpoints.metaChangelog, { params: { limit } })
  },

  featureFlags(): Promise<{ features: FeatureFlags }> {
    return request.get<{ features: FeatureFlags }>(Endpoints.metaFeatureFlags)
  },
}
