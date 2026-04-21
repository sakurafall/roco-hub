import { request } from '../request'
import { Endpoints } from '../endpoints'
import { NotImplementedError } from '../errors'
import type { AuthTokens, SilentLoginResult, User, AppChannel } from '@/types/user'

export interface SilentLoginPayload {
  channel: AppChannel
  code?: string // mp-weixin
  deviceId?: string // h5
}

export const authService = {
  /**
   * 真实实现：调 /v1/auth/silent-login。骨架阶段调用 __mock 版本。
   */
  silentLogin(payload: SilentLoginPayload): Promise<SilentLoginResult> {
    return request.post<SilentLoginResult>(Endpoints.silentLogin, payload)
  },

  refresh(refreshToken: string): Promise<SilentLoginResult> {
    return request.post<SilentLoginResult>(Endpoints.refresh, { refreshToken })
  },

  bindDevice(_payload: unknown): Promise<unknown> {
    throw new NotImplementedError(Endpoints.bindDevice)
  },

  /**
   * 仅骨架阶段使用：直接返回一个 mock 的鉴权信息，
   * 让 useSilentLogin 流程在双端跑通而不依赖真实后端。
   */
  __mockSilentLogin(channel: AppChannel, deviceId?: string): SilentLoginResult {
    const user: User = {
      id: 'mock-user-' + (deviceId ?? 'unknown').slice(0, 8),
      channel,
      deviceId,
      isNew: true,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    }
    const tokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 7200,
    }
    return { ...tokens, user }
  },
}
