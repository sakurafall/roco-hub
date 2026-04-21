import type { AppConfig } from './index'

/**
 * 开发环境配置
 * H5：apiBaseUrl 留空，走 vite.config.ts 里的 dev proxy 转发，绕开浏览器跨域
 * 小程序：必须是完整 URL，直连 VITE_API_BASE_URL
 */
let resolvedApiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? ''

// #ifdef H5
resolvedApiBaseUrl = ''
// #endif

const devConfig: AppConfig = {
  env: 'dev',
  apiBaseUrl: resolvedApiBaseUrl,
  cdnBaseUrl: import.meta.env.VITE_CDN_BASE_URL,
  appVersion: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
  analyticsEnabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  requestTimeoutMs: 15_000,
  featureFlagEndpoint: '/v1/meta/feature-flags',
}

export default devConfig
