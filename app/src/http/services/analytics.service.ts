import { request } from '../request'
import { Endpoints } from '../endpoints'
import type { AnalyticsCommon, AnalyticsEvent } from '@/types/event'

export interface AnalyticsBatchPayload {
  events: AnalyticsEvent[]
  common: AnalyticsCommon
}

export interface AnalyticsBatchResult {
  accepted: number
  rejected: { eventId: string; reason: string }[]
}

export const analyticsService = {
  report(payload: AnalyticsBatchPayload): Promise<AnalyticsBatchResult> {
    return request.post<AnalyticsBatchResult>(Endpoints.analyticsEvents, payload)
  },
}
