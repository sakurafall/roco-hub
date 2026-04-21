import { useUserStore } from '@/stores/user'
import { authService } from '@/http/services/auth.service'
import { getPlatform } from '@/utils/env'

/**
 * 静默登录入口（骨架阶段使用 mock 实现）。
 * Phase 1 第 4 步对接后端后，把 __mockSilentLogin 替换为 silentLogin 即可。
 */
export function useSilentLogin() {
  const user = useUserStore()

  async function run() {
    // 已有 token 则跳过
    if (user.accessToken()) return

    const channel = getPlatform()
    const result = authService.__mockSilentLogin(channel, user.deviceId)
    user.setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    })
    user.setProfile(result.user)
  }

  return { run }
}
