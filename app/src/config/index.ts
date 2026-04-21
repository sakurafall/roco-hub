import devConfig from './dev'
import prodConfig from './prod'

export type AppEnv = 'dev' | 'staging' | 'prod'

export interface AppConfig {
  env: AppEnv
  apiBaseUrl: string
  cdnBaseUrl: string
  appVersion: string
  analyticsEnabled: boolean
  requestTimeoutMs: number
  featureFlagEndpoint: string
}

const currentEnv = (import.meta.env.VITE_APP_ENV ?? 'dev') as AppEnv

const configMap: Record<AppEnv, AppConfig> = {
  dev: devConfig,
  staging: devConfig,
  prod: prodConfig,
}

export function getConfig(): AppConfig {
  return configMap[currentEnv] ?? devConfig
}

export const APP_VERSION = getConfig().appVersion
