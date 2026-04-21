/**
 * 埋点事件类型，事件名清单源于 docs/04-competitor-edge-and-metrics.md §3
 */

import type { AppChannel } from './user'

export type AnalyticsEventName =
  | 'app_launch'
  | 'app_show'
  | 'app_hide'
  | 'page_view'
  | 'search_submit'
  | 'spirit_detail_view'
  | 'spirit_card_click'
  | 'spirit_card_long_press'
  | 'spirit_list_search'
  | 'spirit_list_filter_open'
  | 'spirit_list_filter_confirm'
  | 'spirit_list_filter_type_select'
  | 'spirit_list_filter_form_select'
  | 'spirit_list_filter_egg_select'
  | 'spirit_list_filter_season'
  | 'spirit_list_sort_change'
  | 'spirit_list_clear_all'
  | 'spirit_list_reload'
  | 'home_search_focus'
  | 'home_banner_click'
  | 'home_quick_tool_click'
  | 'home_hot_spirit_click'
  | 'home_recent_spirit_click'
  | 'favorite_toggle'
  | 'share_card_generate'
  | 'hatch_predict_submit'
  | 'theme_switch'
  | 'tool_open'
  | (string & {})

export interface AnalyticsEvent {
  eventId: string
  eventName: AnalyticsEventName
  timestamp: number
  sessionId: string
  properties?: Record<string, unknown>
}

export interface AnalyticsCommon {
  channel: AppChannel
  platform: string
  appVersion: string
  dataVersion?: string
  theme?: string
  network?: string
}
