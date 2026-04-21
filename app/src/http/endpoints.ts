/**
 * 端点常量集中定义，便于后续重命名与契约对齐
 * 与 docs/06 §4.x 一一对应
 */

export const Endpoints = {
  // 4.1 鉴权
  silentLogin: '/v1/auth/silent-login',
  refresh: '/v1/auth/refresh',
  bindDevice: '/v1/auth/bind-device',

  // 4.2 精灵
  spirits: '/v1/spirits',
  spiritDetail: (id: string) => `/v1/spirits/${id}`,
  spiritSearch: '/v1/spirits/search',

  // 4.3 收藏
  favorites: '/v1/favorites',
  favoriteDelete: (id: string) => `/v1/favorites/${id}`,
  favoritesBatchDelete: '/v1/favorites:batchDelete',

  // 4.4 工具
  toolTypeMatchup: '/v1/tools/type-matchup',
  toolHatchPredict: '/v1/tools/hatch/predict',

  // 4.5 元数据
  metaDataVersion: '/v1/meta/data-version',
  metaChangelog: '/v1/meta/changelog',
  metaFeatureFlags: '/v1/meta/feature-flags',

  // 4.6 反馈
  feedback: '/v1/feedback',
  feedbackUploadToken: '/v1/feedback/uploadToken',

  // 4.7 埋点
  analyticsEvents: '/v1/analytics/events',

  // ⚠️ 临时：当前真实后端尚未对齐 docs/06 契约，先用其原生路径
  // 后端切换到 /v1/spirits 后删除这两行
  realSpiritList: '/api/spirit/list',
  realSpiritFilters: '/api/spirit/filters',
} as const
