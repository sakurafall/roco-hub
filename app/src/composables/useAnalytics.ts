import { uuid, getPlatform } from '@/utils/env'
import { APP_VERSION, getConfig } from '@/config'
import { useDataStore } from '@/stores/data'
import { useUiStore } from '@/stores/ui'
import type { AnalyticsEvent, AnalyticsEventName } from '@/types/event'

/**
 * 埋点入口（骨架阶段仅 console，接入后端后接 analyticsService.report）。
 * 统一前缀 [LOKA-ANALYTICS]，便于在控制台搜索。
 */
const SESSION_ID = uuid()
const TAG = '[LOKA-ANALYTICS]'

export function useAnalytics() {
  const dataStore = useDataStore()
  const uiStore = useUiStore()
  const cfg = getConfig()

  function track(eventName: AnalyticsEventName, properties?: Record<string, unknown>) {
    const event: AnalyticsEvent = {
      eventId: uuid(),
      eventName,
      timestamp: Date.now(),
      sessionId: SESSION_ID,
      properties,
    }
    if (!cfg.analyticsEnabled) {
      console.log(TAG, 'disabled, skip', event.eventName, properties)
      return
    }
    console.log(TAG, event.eventName, {
      properties,
      common: {
        channel: getPlatform(),
        appVersion: APP_VERSION,
        dataVersion: dataStore.version,
        theme: uiStore.themeName,
      },
    })
  }

  return { track }
}
