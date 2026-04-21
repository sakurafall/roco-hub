import type { AppChannel } from '@/types/user'

/**
 * 返回当前运行平台标识，与 docs/06 §3.2 X-App-Channel 字段一致。
 * 编译时常量 process.env.UNI_PLATFORM 由 vite-plugin-uni 注入。
 */
export function getPlatform(): AppChannel {
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  // #ifdef H5
  return 'h5'
  // #endif
  // 兜底（其他平台暂未启用）
  return 'h5'
}

/**
 * 人类可读的平台名称（用于首页 Hello World 卡片显示）。
 */
export function getPlatformLabel(): string {
  const platform = getPlatform()
  if (platform === 'mp-weixin') return '微信小程序'
  return 'H5'
}

/**
 * 简单的 UUID v4，避免引入第三方依赖。
 * 用于 X-Request-Id / X-Device-Id 等场景。
 */
export function uuid(): string {
  // 参考 RFC4122 v4 简化实现
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex: string[] = []
  for (let i = 0; i < 16; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'))
  }
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex
    .slice(8, 10)
    .join('')}-${hex.slice(10, 16).join('')}`
}
