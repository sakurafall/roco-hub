import type { AppConfig } from './index'

/**
 * 生产环境配置
 * H5：apiBaseUrl 留空，依赖部署侧 nginx / 网关把 /api、/v1 转发到后端
 *     如未来要走完全独立的 api 域名（带 CORS），把 VITE_API_BASE_URL 直接传完整 URL 并删掉下面的 #ifdef
 * 小程序：apiBaseUrl 必须是完整 HTTPS URL（微信白名单要求）
 */
let resolvedApiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? ''

// #ifdef H5
resolvedApiBaseUrl = ''
// #endif

const prodConfig: AppConfig = {
  env: 'prod',
  apiBaseUrl: resolvedApiBaseUrl,
  cdnBaseUrl: import.meta.env.VITE_CDN_BASE_URL,
  appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
  analyticsEnabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  requestTimeoutMs: 15_000,
  featureFlagEndpoint: '/v1/meta/feature-flags',
}

export default prodConfig
