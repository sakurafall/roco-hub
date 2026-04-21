/**
 * 用户相关类型，源于 docs/02 §2.5 与 docs/06 §4.1
 */

export type AppChannel = 'mp-weixin' | 'h5'

export interface User {
  id: string
  channel: AppChannel
  openid?: string
  unionid?: string
  deviceId?: string
  nickname?: string
  avatar?: string
  isNew?: boolean
  createdAt?: string
  lastActiveAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface SilentLoginResult extends AuthTokens {
  user: User
}

export interface Favorite {
  id: string
  userId?: string
  targetType: 'SPIRIT' | 'SKILL' | 'TEAM' | 'STRATEGY' | 'UGC_POST' | 'CREATOR' | 'THEME'
  targetId: string
  folderId?: string
  tags?: string[]
  createdAt: string
}
